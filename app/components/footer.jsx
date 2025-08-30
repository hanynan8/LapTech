"use client"

import React, { useState, useEffect } from 'react';
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

const Footer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب البيانات من الـ API
    const fetchData = async () => {
      try {
        const response = await fetch('https://restaurant-back-end.vercel.app/api/data');
        const jsonData = await response.json();
        // نفترض أن الـ footer موجود في jsonData.footer[0]
        setData(jsonData.footer[0]);
      } catch (error) {
        console.error('Error fetching footer data:', error);
        // بيانات افتراضية للطوارئ
        setData({
          company: {
            name: "Teck Lap Elite",
            subtitle: "نقدم حلول التكنولوجيا المتطورة والابتكار الرقمي",
            year: "2024"
          },
          sections: [],
          socialLinks: [],
          bottomLinks: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>جاري التحميل...</p>
        </div>
      </footer>
    );
  }

  const iconComponents = {
    FaTwitter: FaTwitter,
    FaFacebook: FaFacebook,
    FaLinkedin: FaLinkedin,
    FaInstagram: FaInstagram,
    FaYoutube: FaYoutube
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* القسم العلوي */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* معلومات الشركة */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              {data.company.name}
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              {data.company.subtitle}
            </p>
            <p className="text-gray-500 mb-6">
              {data.company.description}
            </p>
            
            {/* وسائل التواصل الاجتماعي */}
            <div className="flex space-x-4 rtl:space-x-reverse">
              {data.socialLinks.map((social, index) => {
                const IconComponent = iconComponents[social.icon];
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded-full hover:bg-purple-600 transition-colors duration-300"
                    aria-label={social.platform}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                  </a>
                );
              })}
            </div>
          </div>

          {/* الأقسام الديناميكية */}
          {data.sections.map((section, index) => (
            <div key={index} className="mt-6 lg:mt-0">
              <h4 className="text-lg font-semibold mb-4 text-purple-300">
                {section.title}
              </h4>
              
              {section.links ? (
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 space-y-3">
                  {section.content.address && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="w-5 h-5 mt-1 ml-2 text-purple-400" />
                      <span>{section.content.address}</span>
                    </div>
                  )}
                  {section.content.phone && (
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 ml-2 text-purple-400" />
                      <a href={`tel:${section.content.phone}`} className="hover:text-white">
                        {section.content.phone}
                      </a>
                    </div>
                  )}
                  {section.content.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 ml-2 text-purple-400" />
                      <a href={`mailto:${section.content.email}`} className="hover:text-white">
                        {section.content.email}
                      </a>
                    </div>
                  )}
                  {section.content.workingHours && (
                    <div className="flex items-start">
                      <FaClock className="w-4 h-4 mt-1 ml-2 text-purple-400" />
                      <span>{section.content.workingHours}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* القسم السفلي */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {data.company.year} {data.company.name}. جميع الحقوق محفوظة.
            </p>
            
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              {data.bottomLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
