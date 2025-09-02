'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ChevronDown, ChevronLeft } from 'lucide-react';

export default function Navbar({ navbarData }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  // قائمة المنتجات الفرعية
  const productsSubMenu = [
    { text: 'لابتوب', href: '/laptop' },
    { text: 'مكونات كمبيوتر', href: '/component' },
    { text: 'تجميعات PC', href: '/pc-builds' },
    { text: 'اكسسوارات', href: '/accessories' },
    { text: 'وسائط تخزين', href: '/storage-devices' },
    { text: 'شاشات', href: '/monitors' },
    { text: 'نقاط البيع', href: '/pos' },
    { text: 'طابعات', href: '/printers' },
    { text: 'منتجات اخري', href: '/other' }
  ];

  // إغلاق الدروب داون عند النقر خارجه (للديسكتوب)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.products-dropdown')) {
        setProductsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // إغلاق السايد بار عند النقر على الأوفرلاي
  useEffect(() => {
    const handleOverlayClick = (event) => {
      if (event.target === overlayRef.current) {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };

    if (mobileOpen) {
      document.addEventListener('click', handleOverlayClick);
      // منع التمرير في الخلفية
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('click', handleOverlayClick);
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // إغلاق السايد بار عند الضغط على ESC
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [mobileOpen]);

  if (!navbarData) return null;

  const companyName = navbarData.company?.name || 'اسم الشركة';
  const logoGradient = navbarData.company?.logoGradient || 'from-purple-600 to-blue-600';

  const closeSidebar = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  return (
    <div dir="rtl" className="font-arabic">
      <header className="bg-white/90 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200/50 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center  flex-row-reverse md:flex-row justify-between h-14 sm:h-16">
            {/* Company Logo/Name - Right (Arabic) */}
            <div className="flex items-center">
              <h1 className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}>
                {companyName}
              </h1>
            </div>

            {/* Desktop Navigation - Center */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <ul className="flex items-center gap-8 lg:gap-12">
                {navbarData.navLinks?.map((link, i) => (
                  <li key={i} className="relative">
                    {link.text === 'المنتجات' || link.text === 'منتجات' ? (
                      <div className="products-dropdown relative">
                        <button
                          onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                          className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                          aria-haspopup="true"
                          aria-expanded={productsDropdownOpen}
                        >
                          {link.text}
                          <ChevronDown 
                            size={16} 
                            className={`transform transition-transform duration-200 ${productsDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        
                        {productsDropdownOpen && (
                          <div className="absolute top-full right-1/2 transform translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/70 py-3 z-20 backdrop-blur-sm">
                            {productsSubMenu.map((subLink, subI) => (
                              <Link
                                key={subI}
                                href={subLink.href}
                                className="block px-4 py-2.5 text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-200 mx-2 rounded-lg text-right"
                                onClick={() => setProductsDropdownOpen(false)}
                              >
                                {subLink.text}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-700 hover:text-purple-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        {link.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Button - Left (Arabic) */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="فتح القائمة"
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          aria-hidden="true"
        >
          {/* Sidebar */}
          <div 
            ref={sidebarRef}
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
              mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-l from-gray-50 to-white">
              <h2 className={`text-xl font-bold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}>
                {companyName}
              </h2>
              <button
                onClick={closeSidebar}
                aria-label="إغلاق القائمة"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4">
                <ul className="space-y-2">
                  {navbarData.navLinks?.map((link, i) => (
                    <li key={i}>
                      {link.text === 'المنتجات' || link.text === 'منتجات' ? (
                        <div>
                          <button
                            onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                            className="w-full flex items-center justify-between p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg transition-all duration-200"
                          >
                            <span className="font-medium">{link.text}</span>
                            <ChevronLeft 
                              size={18} 
                              className={`transform transition-transform duration-200 ${mobileProductsOpen ? 'rotate-90' : ''}`}
                            />
                          </button>
                          
                          {mobileProductsOpen && (
                            <div className="mt-2 mr-4 space-y-1">
                              {productsSubMenu.map((subLink, subI) => (
                                <Link
                                  key={subI}
                                  href={subLink.href}
                                  className="block p-3 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-all duration-200 border-r-2 border-transparent hover:border-purple-300 text-right"
                                  onClick={closeSidebar}
                                >
                                  {subLink.text}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className="block p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg transition-all duration-200 font-medium"
                          onClick={closeSidebar}
                        >
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-l from-gray-50 to-white">
              <p className="text-center text-sm text-gray-500">
                مرحباً بك في {companyName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}