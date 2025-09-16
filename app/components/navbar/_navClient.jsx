'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  User,
  LogOut,
  LogIn,
  ShoppingCart,
} from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar({ navbarData }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const fixedPages = ['/', '/contact', '/location', '/aboutus'];

  const dynamicPrefixes = [
    '/laptop/',
    '/accessoires/',
    '/component/',
    '/monitors/',
    '/other/',
    '/pc-builds/',
    '/post/',
    '/printers/',
    '/storage-devices/',
  ];

  const isFixedPage =
    fixedPages.includes(pathname) ||
    dynamicPrefixes.some((prefix) => pathname.startsWith(prefix));

  const productsSubMenu = [
    { text: 'لابتوب', href: '/laptop' },
    { text: 'مكونات كمبيوتر', href: '/component' },
    { text: 'تجميعات PC', href: '/pc-builds' },
    { text: 'اكسسوارات', href: '/accessories' },
    { text: 'وسائط تخزين', href: '/storage-devices' },
    { text: 'شاشات', href: '/monitors' },
    { text: 'نقاط البيع', href: '/pos' },
    { text: 'طابعات', href: '/printers' },
    { text: 'منتجات اخري', href: '/other' },
  ];

  // إغلاق الدروب داون عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.products-dropdown'))
        setProductsDropdownOpen(false);
      if (!e.target.closest('.user-dropdown')) setUserDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // إغلاق السايدبار عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target === overlayRef.current) {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  // ESC لإغلاق القائمة
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileOpen]);

  // جلب عدد المنتجات
  const fetchCartCount = async () => {
    try {
      if (session) {
        const res = await fetch(
          'https://restaurant-back-end.vercel.app/api/data?collection=carts'
        );
        if (res.ok) {
          const data = await res.json();
          const userCart = data.filter(
            (item) => item.email === session.user.email
          );
          const count = userCart.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );
          setCartCount(count);
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const count = localCart.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        setCartCount(count);
      }
    } catch (err) {
      console.error('Error fetching cart count:', err);
    }
  };

  // تحديث حي: استماع للأحداث + polling
  // في ملف Navbar.js - تحسين جزء تحديث عداد السلة

  // استبدال الكود الحالي في useEffect بهذا الكود المحسن:

  useEffect(() => {
    // جلب العداد عند التحميل الأول
    fetchCartCount();

    // استماع لتغييرات localStorage للمستخدمين غير المسجلين
    const handleStorageChange = (e) => {
      if (e.key === 'cart' && !session) {
        fetchCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // استماع للأحداث المخصصة للتحديث الفوري
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);

    // استماع لأحداث إضافة/حذف/تحديث منتجات
    const handleProductAdded = (event) => {
      const { quantity = 1 } = event.detail || {};
      setCartCount((prev) => prev + quantity);
    };

    const handleProductRemoved = (event) => {
      const { quantity = 1 } = event.detail || {};
      setCartCount((prev) => Math.max(0, prev - quantity));
    };

    const handleProductUpdated = (event) => {
      const { oldQuantity = 0, newQuantity = 0 } = event.detail || {};
      const difference = newQuantity - oldQuantity;
      setCartCount((prev) => Math.max(0, prev + difference));
    };

    window.addEventListener('productAddedToCart', handleProductAdded);
    window.addEventListener('productRemovedFromCart', handleProductRemoved);
    window.addEventListener('productQuantityUpdated', handleProductUpdated);

    // polling للمستخدمين المسجلين (تقليل الفترة لـ 5 ثواني)
    let interval;
    if (session) {
      interval = setInterval(fetchCartCount, 5000);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('productAddedToCart', handleProductAdded);
      window.removeEventListener(
        'productRemovedFromCart',
        handleProductRemoved
      );
      window.removeEventListener(
        'productQuantityUpdated',
        handleProductUpdated
      );
      if (interval) clearInterval(interval);
    };
  }, [session]);
  if (!navbarData) return null;

  const companyName = navbarData.company?.name || 'اسم الشركة';
  const logoGradient =
    navbarData.company?.logoGradient || 'from-purple-600 to-blue-600';

  const closeSidebar = () => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
  };

  const handleSignOut = () => {
    signOut();
    setUserDropdownOpen(false);
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getFullUserName = () =>
    session?.user?.name || session?.user?.email || 'المستخدم';

  // Cart Badge Component
  const CartBadge = ({ count, size = 'normal', mobile = false }) => {
    if (count <= 0) return null;

    const getBadgeSize = () => {
      if (mobile) return 'w-5 h-5 text-xs';
      return size === 'small'
        ? 'min-w-[18px] h-[18px] text-xs'
        : 'min-w-[22px] h-[22px] text-xs';
    };

    const getBadgePosition = () => {
      if (mobile) return '-top-1 -left-1';
      return '-top-2 -left-2';
    };

    return (
      <span
        className={`absolute ${getBadgePosition()} ${getBadgeSize()} 
        bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold 
        rounded-full flex items-center justify-center 
        shadow-lg border-2 border-white
        transform transition-all duration-200 
        animate-pulse hover:animate-none hover:scale-110
        ${count > 99 ? 'px-1' : ''}`}
      >
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <div dir="rtl" className="font-arabic">
      {isFixedPage && <div className="h-14 sm:h-16"></div>}

      <header
        className={`bg-white/90 backdrop-blur-lg z-40 border-b border-gray-200/50 shadow-sm ${
          isFixedPage ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
        }`}
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center flex-row-reverse md:flex-row justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1
                className={`text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}
              >
                {companyName}
              </h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <ul className="flex items-center gap-8 lg:gap-12">
                {navbarData.navLinks?.map((link, i) => (
                  <li key={i} className="relative">
                    {['المنتجات', 'منتجات'].includes(link.text) ? (
                      <div className="products-dropdown relative">
                        <button
                          onClick={() =>
                            setProductsDropdownOpen(!productsDropdownOpen)
                          }
                          className="flex items-center gap-1 text-gray-700 hover:text-purple-600 transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
                        >
                          {link.text}
                          <ChevronDown
                            size={16}
                            className={`transform transition-transform duration-200 ${
                              productsDropdownOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {productsDropdownOpen && (
                          <div className="absolute top-full right-1/2 translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200/70 py-3 z-20">
                            {productsSubMenu.map((sub, idx) => (
                              <Link
                                key={idx}
                                href={sub.href}
                                className="block px-4 py-2.5 text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 mx-2 rounded-lg text-right"
                                onClick={() => setProductsDropdownOpen(false)}
                              >
                                {sub.text}
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

            {/* Actions - swapped: Auth/Name first, then Cart */}
            <div className="hidden md:flex items-center gap-4">
              {status === 'loading' ? (
                <div className="p-2 rounded-lg bg-gray-100 animate-pulse w-6 h-6" />
              ) : session ? (
                <div className="user-dropdown relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors"
                  >
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="user"
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center">
                        {getUserInitials(session.user?.name)}
                      </div>
                    )}
                    <span className="text-sm font-medium whitespace-nowrap">
                      {getFullUserName()}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transform transition-transform duration-200 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200/70 py-3 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getFullUserName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 mx-2 rounded-lg"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} />
                        الملف الشخصي
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gradient-to-l hover:from-red-50 hover:to-orange-50 hover:text-red-600 mx-2 rounded-lg text-right"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium"
                >
                  <LogIn size={16} />
                  تسجيل الدخول
                </button>
              )}

              <Link
                href="/cart"
                className="relative p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 transition-all duration-300 group"
              >
                <ShoppingCart
                  size={22}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <CartBadge count={cartCount} />
              </Link>
            </div>

            {/* Mobile Section - swapped: Auth/Name first, then Cart, then Menu */}
            <div className="flex items-center md:hidden gap-2">
              {status !== 'loading' &&
                (session ? (
                  <Link href="/profile">
                    <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="user"
                          className="w-6 h-6 rounded-full object-cover border border-purple-200"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold flex items-center justify-center">
                          {getUserInitials(session.user?.name)}
                        </div>
                      )}
                    </button>
                  </Link>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors"
                  >
                    <LogIn size={20} />
                  </button>
                ))}

              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors group"
              >
                <ShoppingCart
                  size={20}
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <CartBadge count={cartCount} mobile />
              </Link>

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

      {/* Overlay + Sidebar */}
      {mobileOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
        >
          <div
            ref={sidebarRef}
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${
              mobileOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2
                className={`text-xl font-bold bg-gradient-to-r ${logoGradient} bg-clip-text text-transparent`}
              >
                {companyName}
              </h2>
              <button
                onClick={closeSidebar}
                aria-label="إغلاق"
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* User Info */}
            {session && (
              <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-purple-50 to-blue-50">
                <div className="flex items-center gap-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="user"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold flex items-center justify-center">
                      {getUserInitials(session.user?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {getFullUserName()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Nav */}
            <div className="flex-1 overflow-y-auto h-full pb-20">
              <nav className="p-4">
                <ul className="space-y-2">
                  {navbarData.navLinks?.map((link, i) => (
                    <li key={i}>
                      {['المنتجات', 'منتجات'].includes(link.text) ? (
                        <div>
                          <button
                            onClick={() =>
                              setMobileProductsOpen(!mobileProductsOpen)
                            }
                            className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg"
                          >
                            <span className="font-medium">{link.text}</span>
                            <ChevronLeft
                              size={18}
                              className={`transform transition-transform duration-200 ${
                                mobileProductsOpen ? 'rotate-90' : ''
                              }`}
                            />
                          </button>
                          {mobileProductsOpen && (
                            <div className="mt-2 mr-4 space-y-1">
                              {productsSubMenu.map((sub, idx) => (
                                <Link
                                  key={idx}
                                  href={sub.href}
                                  className="block p-3 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-lg border-r-2 border-transparent hover:border-purple-300 text-right"
                                  onClick={closeSidebar}
                                >
                                  {sub.text}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className="block p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg font-medium"
                          onClick={closeSidebar}
                        >
                          {link.text}
                        </Link>
                      )}
                    </li>
                  ))}

                  {/* Session related actions first (profile / login) */}
                  {session ? (
                    <>
                      <li className="pt-2 border-t border-gray-200 mt-4">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg font-medium"
                          onClick={closeSidebar}
                        >
                          <User size={18} />
                          الملف الشخصي
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            handleSignOut();
                            closeSidebar();
                          }}
                          className="flex items-center gap-3 w-full p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-red-50 hover:to-orange-50 hover:text-red-600 rounded-lg font-medium"
                        >
                          <LogOut size={18} />
                          تسجيل الخروج
                        </button>
                      </li>
                    </>
                  ) : (
                    <li className="pt-2 border-t border-gray-200 mt-4">
                      <button
                        onClick={() => {
                          signIn();
                          closeSidebar();
                        }}
                        className="flex items-center gap-3 w-full p-3 text-right bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        <LogIn size={18} />
                        تسجيل الدخول
                      </button>
                    </li>
                  )}

                  {/* Cart placed after auth actions (swapped) */}
                  <li>
                    <Link
                      href="/cart"
                      className="flex items-center gap-3 p-3 text-right text-gray-700 hover:bg-gradient-to-l hover:from-purple-50 hover:to-blue-50 hover:text-purple-600 rounded-lg font-medium group"
                      onClick={closeSidebar}
                    >
                      <div className="relative">
                        <ShoppingCart
                          size={18}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                        <CartBadge count={cartCount} size="small" />
                      </div>
                      السلة
                      {cartCount > 0 && (
                        <span className="mr-auto bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                          {cartCount > 99 ? '99+' : cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-center text-sm text-gray-500">
              مرحباً بك في {companyName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
