'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar({ navbarData }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  const timerRef = useRef(null);

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

  // إغلاق الدروب داون عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.products-dropdown')) {
        setProductsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!navbarData) return null;

  const companyName = navbarData.company?.name || 'اسم الشركة';
  const logoGradient = navbarData.company?.logoGradient || 'from-purple-600 to-blue-600';
  const cartGradient = navbarData.cartButton?.gradient || 'from-purple-600 to-blue-600';

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* grid layout with 3 columns: left = cart, center = nav, right = logo */}
        <div className="grid grid-cols-12 items-center h-16">
          {/* LEFT: Cart (takes 2 columns) */}
          <div className="col-span-2 flex items-center justify-start">
            <button
              aria-label="Open cart"
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r ${cartGradient} shadow-sm hover:scale-105 transition-transform`}
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">
                {navbarData.cartButton?.text || 'السلة'}
              </span>
            </button>
          </div>

          {/* CENTER: Nav links (takes 8 columns for more space) */}
          <nav className="col-span-8 flex items-center justify-center">
            <ul className="hidden md:flex items-center gap-12 flex-row-reverse">
              {navbarData.navLinks?.map((link, i) => (
                <li key={i} className="relative">
                  {/* تحقق من إذا كان الرابط هو "المنتجات" */}
                  {link.text === 'المنتجات' || link.text === 'منتجات' ? (
                    <div className="products-dropdown relative">
                      <button
                        onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                        className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors py-2 px-2"
                        aria-haspopup="true"
                        aria-expanded={productsDropdownOpen}
                      >
                        {link.text}
                        <ChevronDown 
                          size={16} 
                          className={`transform transition-transform ${productsDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      
                      {/* القائمة المنسدلة */}
                      {productsDropdownOpen && (
                        <div 
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10"
                          role="menu"
                        >
                          {productsSubMenu.map((subLink, subI) => (
                            <Link
                              key={subI}
                              href={subLink.href}
                              className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
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
                      className="text-gray-700 hover:text-purple-600 transition-colors py-2 px-2"
                    >
                      {link.text}
                    </Link>
                  )}
                </li>
              ))}
            </ul> 

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Toggle menu"
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </nav>

          {/* RIGHT: Company logo/name (takes 2 columns) */}
          <div className="col-span-2 flex items-center justify-end">
            <h1
              className={`text-2xl font-semibold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}
            >
              {companyName}
            </h1>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden mt-2">
            <div className="bg-white rounded-lg shadow-md p-4">
              <ul className="flex flex-col gap-3">
                {navbarData.navLinks?.map((link, i) => (
                  <li key={i}>
                    {link.text === 'المنتجات' || link.text === 'منتجات' ? (
                      <div>
                        <div className="text-gray-700 py-2 px-3 font-medium">
                          {link.text}
                        </div>
                        <div className="pr-4">
                          {productsSubMenu.map((subLink, subI) => (
                            <Link
                              key={subI}
                              href={subLink.href}
                              className="block text-gray-600 py-2 px-3 rounded hover:bg-gray-50 text-sm"
                              onClick={() => setMobileOpen(false)}
                            >
                              {subLink.text}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className="block text-gray-700 py-2 px-3 rounded hover:bg-gray-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.text}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
