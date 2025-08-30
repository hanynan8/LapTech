"use client"

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Headphones, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  CheckCircle,
  ArrowRight,
  Loader
} from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for dynamic icons
  const iconMap = {
    Phone: Phone,
    Mail: Mail,
    MapPin: MapPin,
    Clock: Clock,
    MessageCircle: MessageCircle,
    Headphones: Headphones,
    Globe: Globe,
    Facebook: Facebook,
    Twitter: Twitter,
    Instagram: Instagram,
    Linkedin: Linkedin
  };

  // Fetch contact data from API
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restaurant-back-end.vercel.app/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch contact data');
        }
        const data = await response.json();
        setContactData(data.contact[0]); // Get first contact object
        setError(null);
      } catch (err) {
        setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        console.error('Error fetching contact data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة إرسال النموذج
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        type: 'general'
      });
      
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
  };

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">خطأ في التحميل</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!contactData) {
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
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              {contactData.pageTitle}
            </h1>
            <p className="text-2xl md:text-3xl opacity-90 animate-fade-in-up animation-delay-200">
              {contactData.pageSubtitle}
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full animate-pulse animation-delay-1000"></div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactData.contactInfo?.map((info, index) => {
              const IconComponent = iconMap[info.icon];
              return (
                <div key={index} className="group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transform group-hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                    <div className={`bg-gradient-to-br ${info.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{info.title}</h3>
                    {info.details?.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600 mb-2">{detail}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Additional Info */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{contactData.formLabels?.formTitle}</h2>
                <p className="text-xl text-gray-600">{contactData.formLabels?.formSubtitle}</p>
              </div>

              {showSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 ml-3" />
                  <span className="text-green-800">{contactData.formLabels?.successMessage}</span>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      {contactData.formLabels?.fields?.name?.label}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                      placeholder={contactData.formLabels?.fields?.name?.placeholder}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      {contactData.formLabels?.fields?.email?.label}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                      placeholder={contactData.formLabels?.fields?.email?.placeholder}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      {contactData.formLabels?.fields?.phone?.label}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                      placeholder={contactData.formLabels?.fields?.phone?.placeholder}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      {contactData.formLabels?.fields?.type?.label}
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                    >
                      {contactData.formLabels?.fields?.type?.options?.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    {contactData.formLabels?.fields?.subject?.label}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300"
                    placeholder={contactData.formLabels?.fields?.subject?.placeholder}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">
                    {contactData.formLabels?.fields?.message?.label}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 resize-none"
                    placeholder={contactData.formLabels?.fields?.message?.placeholder}
                  ></textarea>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl text-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                      {contactData.formLabels?.submitButton?.loading}
                    </div>
                  ) : (
                    <>
                      {contactData.formLabels?.submitButton?.default}
                      <Send className="w-5 h-5 inline mr-2" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Contact Methods */}
            <div className="space-y-8">
              <div className="space-y-4">
                {contactData.contactMethods?.map((method, index) => {
                  const IconComponent = iconMap[method.icon];
                  return (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      <div className="flex items-start">
                        <div className={`bg-gradient-to-br ${method.color} w-12 h-12 rounded-xl flex items-center justify-center ml-4 flex-shrink-0`}>
                          {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h4>
                          <p className="text-gray-600 mb-3">{method.description}</p>
                          <button className="text-purple-600 font-bold hover:text-purple-800 transition-colors duration-300">
                            {method.buttonText}
                            <ArrowRight className="w-4 h-4 inline mr-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">{contactData.faqSection?.title}</h2>
            <p className="text-xl text-gray-600">{contactData.faqSection?.subtitle}</p>
          </div>

          <div className="space-y-6">
            {contactData.faqSection?.items?.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <h4 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h4>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media & Footer CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center text-white mb-12">
            <h2 className="text-5xl font-bold mb-6">{contactData.socialSection?.title}</h2>
            <p className="text-2xl opacity-90 mb-8">{contactData.socialSection?.subtitle}</p>
            
            <div className="flex justify-center space-x-6 space-x-reverse">
              {contactData.socialLinks?.map((social, index) => {
                const IconComponent = iconMap[social.icon];
                return (
                  <button
                    key={index}
                    className={`bg-white/20 backdrop-blur-sm p-4 rounded-full ${social.color} transition-all duration-300 transform hover:scale-110`}
                  >
                    {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="text-center">
            <button className="bg-white text-purple-600 px-12 py-4 rounded-full text-xl font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              {contactData.socialSection?.storeButton}
              <ArrowRight className="w-6 h-6 inline mr-3" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;