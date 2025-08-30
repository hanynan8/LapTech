"use client"

import React, { useState, useEffect } from 'react';
import { Users,  Loader, Target, Award, Heart, Star, ChevronRight, Eye, Lightbulb, Shield, Rocket, Globe, TrendingUp, Laptop, Truck, Package, Play, Check, ArrowRight, Clock, MapPin, Phone, Mail, MessageCircle, Calendar, Zap } from 'lucide-react';

const AboutUsPage = () => {
  const [activeValue, setActiveValue] = useState(0);
  const [activeTab, setActiveTab] = useState('history');
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countersStarted, setCountersStarted] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restaurant-back-end.vercel.app/api/data');
        
        if (!response.ok) {
          throw new Error('فشل في تحميل البيانات');
        }
        
        const data = await response.json();
        
        if (data.aboutus && data.aboutus.length > 0) {
          // Navigate through the nested structure to get the actual data
          const actualData = data.aboutus[0].aboutus[0].aboutus[0];
          setAboutData(actualData);
        } else {
          throw new Error('لا توجد بيانات متاحة');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
            <p className="text-xl font-bold">خطأ في تحميل البيانات</p>
            <p className="mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-gray-600">لا توجد بيانات متاحة</p>
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
            <div className="text-center text-white max-w-6xl mx-auto px-4">
              <div className="mb-6 animate-fade-in-up">
                <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                  {aboutData.hero.additionalContent?.welcomeMessage}
                </span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {aboutData.hero.title}
              </h1>
              <p className="text-2xl md:text-3xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
                {aboutData.hero.subtitle}
              </p>
              <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-80 animate-fade-in-up animation-delay-400 leading-relaxed">
                {aboutData.hero.description}
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up animation-delay-600">
                <button className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <Play className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  {aboutData.hero.additionalContent?.primaryButton?.text}
                </button>
                <button className="border-2 border-white/50 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-300">
                  {aboutData.hero.additionalContent?.secondaryButton?.text}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ChevronRight className="w-8 h-8 rotate-90" />
        </div>
      </section>

      {/* Enhanced Story Section with Tabs */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">{aboutData.story.title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">اكتشف رحلتنا عبر الزمن وكيف أصبحنا الخيار الأول</p>
          </div>

          {/* Timeline Tabs */}
          <div className="flex flex-wrap justify-center mb-12 gap-4">
            {aboutData.story.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              {aboutData.story.tabs.map((tab) => (
                activeTab === tab.id && (
                  <div key={tab.id} className="space-y-6">
                    <h3 className="text-3xl font-bold text-gray-900">{tab.content.title}</h3>
                    {tab.id === 'history' && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {tab.content.description}
                        </p>
                        <div className="space-y-4">
                          {tab.content.milestones?.map((milestone, index) => (
                            <div key={index} className="flex items-center gap-4">
                              <div className={`w-3 h-3 bg-${milestone.color}-600 rounded-full`}></div>
                              <span className="text-gray-700">{milestone.text}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    {tab.id === 'milestones' && (
                      <div className="space-y-6">
                        {tab.content.timeline?.map((item, index) => (
                          <div key={index} className={`border-r-4 border-${item.color}-600 pr-6`}>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{item.year} - {item.title}</h4>
                            <p className="text-gray-700">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab.id === 'future' && (
                      <>
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {tab.content.description}
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                          {tab.content.features?.map((feature, index) => {
                            const IconComponent = iconMap[feature.icon] || Zap;
                            return (
                              <div key={index} className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl`}>
                                <IconComponent className="w-8 h-8 text-purple-600 mb-2" />
                                <h4 className="font-bold text-gray-900">{feature.title}</h4>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                    
                    <div className="mt-8">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-24 h-1 rounded"></div>
                    </div>
                  </div>
                )
              ))}
            </div>

            <div className="order-1 md:order-2 relative group">
              <div className="relative overflow-hidden rounded-3xl">
                <img 
                  src={aboutData.story.image}
                  alt="Our Story"
                  className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
                <div className="absolute bottom-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Mission & Vision */}
      <section className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="group bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">{aboutData.mission.title}</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{aboutData.mission.content}</p>
              <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              </div>
            </div>
            
            <div className="group bg-white rounded-3xl p-12 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">{aboutData.vision.title}</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{aboutData.vision.content}</p>
              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              {aboutData.sections?.valuesSection?.title || "قيمنا الأساسية"}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {aboutData.sections?.valuesSection?.subtitle || "المبادئ التي تقودنا نحو التميز والإبداع"}
            </p>
            <div className="mt-8 flex justify-center">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-32 h-1 rounded"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aboutData.values.map((value, index) => {
              const IconComponent = iconMap[value.icon] || Heart;
              return (
                <div 
                  key={value.id} 
                  className="group cursor-pointer"
                  onClick={() => setActiveValue(index)}
                >
                  <div className={`bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-4 transition-all duration-500 relative overflow-hidden ${activeValue === index ? 'ring-4 ring-purple-400 scale-105' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-18 h-18 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                        <IconComponent className="w-9 h-9 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                        {value.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {value.description}
                      </p>
                      
                      <div className="flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Check className="w-4 h-4 ml-1" />
                        <span className="text-sm font-semibold">تطبق دائماً</span>
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
      <section className="py-24 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">{aboutData.sections?.whyChooseUsSection?.title}</h2>
            <p className="text-xl opacity-80">{aboutData.sections?.whyChooseUsSection?.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aboutData.whyChooseUs.map((item) => {
              const IconComponent = iconMap[item.icon] || Shield;
              return (
                <div key={item.id} className="text-center group">
                  <div className={`bg-gradient-to-br ${item.gradient} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              {aboutData.sections?.brandsSection?.title}
            </h2>
            <p className="text-xl text-gray-600">
              {aboutData.sections?.brandsSection?.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {aboutData.brands.map((brand, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 h-32 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {brand.logo ? (
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="max-h-16 max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-700 group-hover:text-purple-600 transition-colors">
                      {brand.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Achievements Section */}
      <section id="achievements-section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              {aboutData.sections?.achievementsSection?.title}
            </h2>
            <p className="text-xl text-gray-600">
              {aboutData.sections?.achievementsSection?.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {aboutData.achievements.map((achievement, index) => {
              const IconComponent = iconMap[achievement.icon] || Award;
              return (
                <div key={achievement.id} className="text-center group">
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      
                      <div className={`text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 ${countersStarted ? 'animate-pulse' : ''}`}>
                        {achievement.number}
                      </div>
                      
                      <div className="text-gray-600 text-lg font-semibold">
                        {achievement.label}
                      </div>
                      
                      <div className="mt-4 w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Team Section */}
      {/* <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50"> */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> */}
          {/* <div className="text-center mb-16"> */}
            {/* <h2 className="text-5xl font-bold text-gray-900 mb-4"> */}
              {/* {aboutData.sections?.teamSection?.title} */}
            {/* </h2> */}
            {/* <p className="text-xl text-gray-600"> */}
              {/* {aboutData.sections?.teamSection?.subtitle} */}
            {/* </p> */}
          {/* </div> */}

          {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"> */}
            {/* {aboutData.team.map((member, index) => ( */}
              {/* <div key={member.id} className="group"> */}
                {/* <div className="bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:-translate-y-4 transition-all duration-700 relative"> */}
                  {/* <div className="relative overflow-hidden"> */}
                    {/* <img  */}
                      {/* src={member.image} */}
                      {/* alt={member.name} */}
                      {/* className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" */}
                    {/* /> */}
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
                    
                    {/* Social media icons on hover */}

                  {/* </div> */}
                  
                  {/* <div className="p-6"> */}
                    {/* <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300"> */}
                      {/* {member.name} */}
                    {/* </h3> */}
                    {/* <p className="text-purple-600 font-semibold mb-3">{member.role}</p> */}
                    {/* <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.description}</p> */}
                    {/*  */}
                    {/* <div className="flex items-center justify-between"> */}
                      {/* <div className="flex items-center gap-1"> */}
                        {/* {[...Array(5)].map((_, i) => ( */}
                          {/* <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" /> */}
                        {/* ))} */}
                      {/* </div> */}
                      {/* <span className="text-xs text-gray-500">خبير معتمد</span> */}
                    {/* </div> */}
                  {/* </div> */}
                {/* </div> */}
              {/* </div> */}
            {/* ))} */}
          {/* </div> */}
        {/* </div> */}
      {/* </section> */}

      {/* Customer Reviews Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">{aboutData.sections?.reviewsSection?.title}</h2>
            <p className="text-xl text-gray-600">{aboutData.sections?.reviewsSection?.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aboutData.reviews.map((review, index) => (
              <div key={review.id} className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={review.image} 
                    alt={review.name}
                    className="w-16 h-16 rounded-full object-cover ml-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                    <p className="text-gray-600 text-sm">{review.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {aboutData.sections?.ctaSection?.title}
            </h2>
            <p className="text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
              {aboutData.sections?.ctaSection?.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <button className="group bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <Laptop className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                {aboutData.sections?.ctaSection?.buttons?.primary?.text}
              </button>
              <button className="group border-2 border-white/50 backdrop-blur-sm text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                {aboutData.sections?.ctaSection?.buttons?.secondary?.text}
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              {aboutData.trustIndicators.map((indicator, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold mb-2">{indicator.number}</div>
                  <div className="text-sm opacity-75">{indicator.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;