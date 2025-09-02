'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Car,
  Bus,
  Train,
  Plane,
  Navigation,
  Star,
  Coffee,
  Wifi,
  Shield,
  Users,
  Building,
  Camera,
  Calendar,
  ArrowRight,
  Loader,
  CheckCircle,
} from 'lucide-react';

import Link from 'next/link';

function goToWatssap() {
  window.open('https://wa.me/+2001201061216');
}

const LocationPageClient = ({ initialData, error: serverError }) => {
  const [locationData, setLocationData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && !serverError);
  const [error, setError] = useState(serverError);

  // Icon mapping
  const iconMap = {
    MapPin,
    Clock,
    Phone,
    Mail,
    Car,
    Bus,
    Train,
    Plane,
    Navigation,
    Star,
    Coffee,
    Wifi,
    Shield,
    Users,
    Building,
    Camera,
    Calendar,
    CheckCircle,
  };

  // دالة محسنة لاستخراج البيانات (نفس المنطق من السيرفر)
  const extractLocationData = (data) => {
    if (data.location) {
      if (Array.isArray(data.location)) {
        const firstLocation = data.location[0];
        if (firstLocation) {
          if (firstLocation.location && Array.isArray(firstLocation.location)) {
            return firstLocation.location[0];
          }
          if (firstLocation.pageTitle) {
            return firstLocation;
          }
        }
      } else if (data.location.pageTitle) {
        return data.location;
      }
    }

    const possibleKeys = ['locationData', 'locationInfo', 'locations', 'page'];
    for (const key of possibleKeys) {
      if (data[key] && data[key].pageTitle) {
        return data[key];
      }
    }

    if (data.pageTitle) {
      return data;
    }

    return null;
  };

  // Fallback fetch فقط إذا لم تأت البيانات من السيرفر
  useEffect(() => {
    if (!initialData && !serverError) {
      const fetchLocationData = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            'https://restaurant-back-end.vercel.app/api/data'
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const locationInfo = extractLocationData(data);

          if (!locationInfo) {
            throw new Error('No location data found');
          }

          setLocationData(locationInfo);
          setError(null);
        } catch (err) {
          setError(`فشل في تحميل البيانات: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      fetchLocationData();
    }
  }, [initialData, serverError]);

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <Loader className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center bg-white p-4 sm:p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl sm:text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            خطأ في التحميل
          </h2>
          <p className="text-gray-600 mb-6 text-right">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors w-full"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!locationData) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <p className="text-lg sm:text-xl text-gray-600">لا توجد بيانات متاحة</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            إعادة التحميل
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6">
              {locationData.pageTitle || 'موقعنا'}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl opacity-90">
              {locationData.pageSubtitle ||
                'تعرف على مواقعنا وكيفية الوصول إلينا'}
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-10 sm:w-20 h-10 sm:h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-16 sm:w-32 h-16 sm:h-32 bg-white/5 rounded-full animate-pulse"></div>
      </section>

      {/* Main Location Info */}
      <section className="py-10 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12">
            {/* Location Details */}
            <div className="space-y-4 sm:space-y-8">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-4 sm:p-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {locationData.mainLocation?.title || 'الموقع الرئيسي'}
                </h2>
                <div className="space-y-2 sm:space-y-4">
                  {locationData.mainLocation?.details?.length > 0 ? (
                    locationData.mainLocation.details.map((detail, index) => {
                      const IconComponent = iconMap[detail.icon];
                      return (
                        <div key={index} className="flex items-start">
                          <div
                            className={`bg-gradient-to-br ${
                              detail.color || 'from-purple-500 to-blue-500'
                            } w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex items-center justify-center ml-3 sm:ml-4 flex-shrink-0`}
                          >
                            {IconComponent && (
                              <IconComponent className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                              {detail.title}
                            </h4>
                            <p className="text-gray-600">
                              {detail.description}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      لا توجد تفاصيل موقع متاحة
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              {locationData.workingHours && (
                <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 ml-3" />
                    {locationData.workingHours.title}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
                    {locationData.workingHours.schedule?.map((day, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 rounded-xl"
                      >
                        <span className="font-bold text-gray-900">
                          {day.day}
                        </span>
                        <span className="text-gray-600">{day.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map & Contact */}
            <div className="space-y-4 sm:space-y-8">
              {/* Interactive Map */}
              {locationData.mapSection && (
                <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-lg">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                    {locationData.mapSection.title}
                  </h3>
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 sm:h-80 flex items-center justify-center mb-4 sm:mb-6">
                    <div className="text-center text-gray-600">
                      <MapPin className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" />
                      <p className="text-lg sm:text-xl font-bold">
                        {locationData.mapSection.placeholder?.title || 'موقعنا'}
                      </p>
                      <p className="text-sm">
                        {locationData.mapSection.placeholder?.address ||
                          'العنوان'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                    <button className="flex-1 bg-purple-600 text-white py-2 sm:py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                      <Link href="https://www.google.com/maps?q=24.08935573826058,32.899505653834204">
                        {locationData.mapSection.buttons?.directions ||
                          'اتجاهات'}
                        <Navigation className="w-4 sm:w-5 h-4 sm:h-5 inline mr-2" />
                      </Link>
                    </button>
                    <button
                      onClick={async () => {
                        const mapUrl =
                          'https://www.google.com/maps?q=24.08935573826058,32.899505653834204';
                        try {
                          await navigator.clipboard.writeText(mapUrl);
                          alert('📋 تم نسخ الرابط!');
                        } catch (err) {
                          console.error('فشل النسخ:', err);
                        }
                      }}
                      className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                      {locationData.mapSection.buttons?.share || 'مشاركة'}
                    </button>
                  </div>
                </div>
              )}
              {locationData.quickContact && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-4 sm:p-8 text-white">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                    {locationData.quickContact.title}
                  </h3>
                  <div className="space-y-2 sm:space-y-4">
                    {locationData.quickContact.methods?.map((method, index) => {
                      const IconComponent = iconMap[method.icon];
                      return (
                        <div key={index} className="flex items-center">
                          {IconComponent && (
                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 ml-4" />
                          )}
                          <div>
                            <p className="font-bold">{method.label}</p>
                            <p className="opacity-90">{method.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      {locationData.branches && locationData.branches.locations && (
        <section className="py-10 sm:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                {locationData.branches.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                {locationData.branches.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {locationData.branches.locations.map((branch, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <div
                    className={`bg-gradient-to-br ${
                      branch.color || 'from-purple-500 to-blue-500'
                    } w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}
                  >
                    <Building className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                    {branch.name}
                  </h3>
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1 ml-2 flex-shrink-0" />
                      <p className="text-gray-600">{branch.address}</p>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
                      <p className="text-gray-600">{branch.phone}</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 ml-2 flex-shrink-0" />
                      <p className="text-gray-600">{branch.hours}</p>
                    </div>
                  </div>
                  <Link
                    href={
                      'https://www.google.com/maps?q=24.08935573826058,32.899505653834204'
                    }
                  >
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      {locationData.branches.viewButton || 'عرض التفاصيل'}
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 inline mr-2" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {locationData.features && locationData.features.items && (
        <section className="py-10 sm:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                {locationData.features.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                {locationData.features.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {locationData.features.items.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div
                      className={`bg-gradient-to-br ${
                        feature.color || 'from-purple-500 to-blue-500'
                      } w-12 sm:w-16 h-12 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}
                    >
                      {IconComponent && (
                        <IconComponent className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Visit Us CTA */}
      {locationData.visitSection && (
        <section className="py-10 sm:py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <div className="text-white mb-6 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6">
                {locationData.visitSection.title}
              </h2>
              <p className="text-lg sm:text-2xl opacity-90 mb-6 sm:mb-8">
                {locationData.visitSection.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
              <button className="bg-white text-purple-600 px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Link
                  href={
                    'https://www.google.com/maps?q=24.08935573826058,32.899505653834204'
                  }
                >
                  {locationData.visitSection.buttons?.visit || 'زيارة الموقع'}
                  <MapPin className="w-5 sm:w-6 h-5 sm:h-6 inline mr-3" />
                </Link>
              </button>
              <button
                onClick={() => {
                  goToWatssap();
                }}
                className="bg-white/20 backdrop-blur-sm text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold hover:bg-white/30 transition-all duration-300"
              >
                {locationData.visitSection.buttons?.call || 'الاتصال بنا'}
                <Phone className="w-5 sm:w-6 h-5 sm:h-6 inline mr-3" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LocationPageClient;