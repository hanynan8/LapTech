'use client';

import React from 'react';
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

const iconComponents = {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube
};

export default function Footer({ footerData, loading }) {
  if (loading && !footerData) {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>جاري التحميل...</p>
        </div>
      </footer>
    );
  }

  // Ensure safe shape
  const safe = footerData ?? {
    company: { name: '', subtitle: '', description: '', year: new Date().getFullYear() },
    socialLinks: [],
    sections: [],
    bottomLinks: []
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* top */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* company */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              {safe.company?.name || ''}
            </h3>

            {safe.company?.subtitle && (
              <p className="text-gray-400 text-lg mb-6">{safe.company.subtitle}</p>
            )}

            {safe.company?.description && (
              <p className="text-gray-500 mb-6">{safe.company.description}</p>
            )}

            <div className="flex space-x-4 rtl:space-x-reverse">
              {(safe.socialLinks || []).map((social, idx) => {
                const Icon = iconComponents[social.icon] ?? null;
                return (
                  <a
                    key={idx}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 p-3 rounded-full hover:bg-purple-600 transition-colors duration-300"
                    aria-label={social.platform || `social-${idx}`}
                  >
                    {Icon ? <Icon className="w-5 h-5" /> : (social.platform?.[0] ?? '')}
                  </a>
                );
              })}
            </div>
          </div>

          {/* dynamic sections */}
          {(safe.sections || []).map((section, index) => (
            <div key={index} className="mt-6 lg:mt-0">
              <h4 className="text-lg font-semibold mb-4 text-purple-300">{section.title}</h4>

              {Array.isArray(section.links) && section.links.length > 0 ? (
                <ul className="space-y-3">
                  {section.links.map((link, li) => (
                    <li key={li}>
                      <a
                        href={link.href || '#'}
                        className="text-gray-400 hover:text-white transition-colors duration-300"
                      >
                        {link.text || link.name || ''}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-400 space-y-3">
                  {section.content?.address && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="w-5 h-5 mt-1 ml-2 text-purple-400" />
                      <span>{section.content.address}</span>
                    </div>
                  )}
                  {section.content?.phone && (
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 ml-2 text-purple-400" />
                      <a href={`tel:${section.content.phone}`} className="hover:text-white">
                        {section.content.phone}
                      </a>
                    </div>
                  )}
                  {section.content?.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 ml-2 text-purple-400" />
                      <a href={`mailto:${section.content.email}`} className="hover:text-white">
                        {section.content.email}
                      </a>
                    </div>
                  )}
                  {section.content?.workingHours && (
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

      {/* bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {safe.company?.year ?? new Date().getFullYear()} {safe.company?.name || ''}. جميع الحقوق محفوظة.
            </p>

            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              {(safe.bottomLinks || []).map((link, idx) => (
                <a
                  key={idx}
                  href={link.href || '#'}
                  className="text-gray-500 hover:text-white text-sm transition-colors duration-300"
                >
                  {link.text || link.name || ''}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}