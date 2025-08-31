'use client';

import React, { useState, useEffect, useRef } from 'react';
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

const CACHE_KEY = 'footer_cache_v1';
const CACHE_TTL = 600_000; // 600,000 ms = 10 minutes

const iconComponents = {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts || !obj.data) return null;
    return obj;
  } catch {
    return null;
  }
}

function writeCache(data) {
  try {
    const obj = { ts: Date.now(), data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch {
    // ignore localStorage errors
  }
}

export default function Footer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(null);

  useEffect(() => {
    // read cache
    const cached = readCache();
    const isFresh = cached && (Date.now() - cached.ts < CACHE_TTL);

    if (cached?.data) {
      setData(cached.data);
      setLoading(false); // show cached immediately
    }

    // if cache is fresh, no need to fetch
    if (isFresh) return;

    // otherwise fetch (either first load or background refresh)
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await fetch('https://restaurant-back-end.vercel.app/api/data', {
          signal: controller.signal,
          // force network validation so we update cache when needed
          cache: 'no-cache'
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // try to extract footer object
        const footerData = Array.isArray(json?.footer) ? json.footer[0] : (json?.footer ?? json);

        if (footerData) {
          setData(footerData);
          writeCache(footerData);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          // canceled - ignore
          return;
        }
        console.error('Error fetching footer data:', err);
        // on error, if no cached data, set a minimal fallback so UI doesn't break
        if (!cached?.data) {
          setData({
            company: {
              name: "اسم الشركة",
              subtitle: "",
              description: "",
              year: new Date().getFullYear()
            },
            socialLinks: [],
            sections: [],
            bottomLinks: []
          });
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  if (loading && !data) {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>جاري التحميل...</p>
        </div>
      </footer>
    );
  }

  // ensure safe shape
  const safe = data ?? {
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
