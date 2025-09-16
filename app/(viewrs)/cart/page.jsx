'use client';

import { useSession } from 'next-auth/react';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  LogIn,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL =
  'https://restaurant-back-end.vercel.app/api/data?collection=carts';

const CartPage = () => {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [removingItems, setRemovingItems] = useState(new Set());
  const router = useRouter();

  // دالة مخصصة لجلب بيانات السلة مع إعادة استخدام
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (session) {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        const data = await response.json();
        const userCart = data.filter(
          (item) => item.email === session.user.email
        );
        
        // تجميع العناصر بنفس المعرّف ولكن الحفاظ على العناصر المختلفة منفصلة
        const groupedCart = userCart.reduce((acc, item) => {
          const existingIndex = acc.findIndex(i => 
            i.productId === item.productId && 
            i.name === item.name && 
            i.price === item.price
          );
          
          if (existingIndex > -1) {
            // زيادة الكمية فقط إذا كان المنتج مطابق تماماً
            acc[existingIndex].quantity += item.quantity;
            acc[existingIndex]._ids.push(item._id);
          } else {
            // إضافة عنصر جديد إذا كان مختلفاً
            acc.push({ ...item, _ids: [item._id] });
          }
          return acc;
        }, []);
        
        const validCart = groupedCart.filter(item => typeof item.price === 'number' && item.price > 0);
        setCartItems(validCart);
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // نفس المنطق للتجميع للبيانات المحلية
        const groupedLocal = localCart.reduce((acc, item) => {
          const existingIndex = acc.findIndex(i => 
            i.productId === item.productId && 
            i.name === item.name && 
            i.price === item.price
          );
          
          if (existingIndex > -1) {
            acc[existingIndex].quantity += item.quantity || 1;
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, []);
        
        const validCart = groupedLocal.filter(item => typeof item.price === 'number' && item.price > 0);
        setCartItems(validCart);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // دالة محسنة لتحديث الكمية
  const updateQuantity = async (item, delta) => {
    const oldQuantity = item.quantity;
    const newQuantity = item.quantity + delta;

    if (newQuantity < 1) {
      removeItem(item);
      return;
    }

    // تحديث واجهة المستخدم فورياً
    setUpdatingItems(prev => new Set([...prev, item.productId]));
    
    setCartItems(prev =>
      prev.map(i =>
        i.productId === item.productId && i.name === item.name ? { ...i, quantity: newQuantity } : i
      )
    );

    // تحديث عداد السلة
    window.dispatchEvent(
      new CustomEvent('productQuantityUpdated', {
        detail: { oldQuantity, newQuantity },
      })
    );

    try {
      if (session) {
        // استخدام Promise.all لجعل طلبات الحذف متوازية
        await Promise.all(
          item._ids.map(id => 
            fetch(`${API_URL}&id=${id}`, { method: 'DELETE' })
          )
        );

        const postResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            name: item.name,
            price: item.price,
            currency: item.currency || 'ج.م',
            image: item.image,
            quantity: newQuantity,
            email: session.user.email,
          }),
        });

        if (!postResponse.ok) throw new Error('Failed to add updated item');

        const result = await postResponse.json();
        
        // تحديث الحالة بالمعلومات الجديدة من الخادم
        setCartItems(prev =>
          prev.map(i =>
            i.productId === item.productId && i.name === item.name
              ? { ...i, quantity: newQuantity, _ids: [result._id] }
              : i
          )
        );
      } else {
        // تحديث localStorage
        let localCart = JSON.parse(localStorage.getItem('cart')) || [];
        localCart = localCart.map(i =>
          i.productId === item.productId && i.name === item.name ? { ...i, quantity: newQuantity } : i
        );
        localStorage.setItem('cart', JSON.stringify(localCart));
      }
      
      // إشعار بالتحديث
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error(err);
      
      // التراجع عن التغيير في حالة الخطأ
      setCartItems(prev =>
        prev.map(i =>
          i.productId === item.productId && i.name === item.name ? { ...i, quantity: oldQuantity } : i
        )
      );
      
      window.dispatchEvent(
        new CustomEvent('productQuantityUpdated', {
          detail: { oldQuantity: newQuantity, newQuantity: oldQuantity },
        })
      );
      
      alert('فشل في تحديث الكمية. يرجى المحاولة مرة أخرى.');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.productId);
        return newSet;
      });
    }
  };

  // دالة محسنة لحذف العناصر
  const removeItem = async (item) => {
    setRemovingItems(prev => new Set([...prev, item.productId]));
    
    // التحديث الفوري للواجهة
    setCartItems(prev => prev.filter(i => !(i.productId === item.productId && i.name === item.name)));
    
    window.dispatchEvent(
      new CustomEvent('productRemovedFromCart', {
        detail: { quantity: item.quantity },
      })
    );

    try {
      if (session) {
        // حذف متوازي لجميع عناصر المنتج
        await Promise.all(
          item._ids.map(id => 
            fetch(`${API_URL}&id=${id}`, { method: 'DELETE' })
          )
        );
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const updatedCart = localCart.filter(i => !(i.productId === item.productId && i.name === item.name));
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error(err);
      
      // استعادة العنصر في حالة الخطأ
      setCartItems(prev => [...prev, item]);
      
      window.dispatchEvent(
        new CustomEvent('productAddedToCart', {
          detail: { quantity: item.quantity },
        })
      );
      
      alert('فشل في حذف العنصر. يرجى المحاولة مرة أخرى.');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.productId);
        return newSet;
      });
    }
  };

  // دالة محسنة لتفريغ السلة
  const clearCart = async () => {
    if (!confirm('هل أنت متأكد من حذف جميع العناصر من السلة؟')) return;
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const originalItems = [...cartItems];
    
    // التحديث الفوري للواجهة
    setCartItems([]);
    
    window.dispatchEvent(
      new CustomEvent('productRemovedFromCart', {
        detail: { quantity: totalItems },
      })
    );

    try {
      if (session) {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch cart items for deletion');
        
        const data = await response.json();
        const userItems = data.filter(
          (item) => item.email === session.user.email
        );
        
        // حذف متوازي لجميع العناصر
        await Promise.all(
          userItems.map(item => 
            fetch(`${API_URL}&id=${item._id}`, { method: 'DELETE' })
          )
        );
      } else {
        localStorage.removeItem('cart');
      }
      
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      console.error(err);
      
      // استعادة السلة في حالة الخطأ
      setCartItems(originalItems);
      
      window.dispatchEvent(
        new CustomEvent('productAddedToCart', {
          detail: { quantity: totalItems },
        })
      );
      
      alert('فشل في تفريغ السلة. يرجى المحاولة مرة أخرى.');
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + (item.price ?? 0) * (item.quantity ?? 0), 0)
      .toLocaleString();
  };

  const getTotalNumber = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price ?? 0) * (item.quantity ?? 0),
      0
    );
  };

  const handlePayNow = () => {
    const totalAmount = getTotalNumber();
    const cartData = {
      total: totalAmount,
      items: cartItems,
      currency: 'EGP',
      timestamp: Date.now(),
    };

    localStorage.setItem('paymentData', JSON.stringify(cartData));
    router.push('/pay');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="mr-2 text-gray-600">جاري تحميل السلة...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        <p>خطأ: {error}</p>
        <button 
          onClick={fetchCart}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-full text-center py-20 bg-white rounded-lg shadow-md">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-xl font-semibold text-gray-800 mb-2">سلتك فارغة</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          ابدأ التسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 mx-auto max-w-4xl" dir="rtl">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            سلة التسوق
          </h1>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 font-medium flex items-center transition-colors"
          >
            <Trash2 className="w-5 h-5 ml-2" />
            حذف الكل
          </button>
        </div>

        <div className="space-y-6 w-full">
          {cartItems.map((item, index) => {
            const isUpdating = updatingItems.has(item.productId);
            const isRemoving = removingItems.has(item.productId);

            if (isRemoving) {
              return (
                <div key={`removing-${item.productId}-${index}`} className="flex items-center justify-center py-4 opacity-70">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600 mr-2" />
                  <span>جاري حذف المنتج...</span>
                </div>
              );
            }

            return (
              <div
                key={`${item.productId}-${item.name}-${index}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-b-0 gap-4 sm:gap-0 w-full transition-all duration-200 ${
                  isUpdating ? 'opacity-70' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md shadow-sm self-center sm:self-auto"
                  />
                  <div className="text-center sm:text-right">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      {item.name}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {(item.price ?? 0).toLocaleString()} {item.currency ?? 'ج.م'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-end">
                  <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 ml-4">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      disabled={isUpdating}
                      className={`text-gray-600 hover:text-gray-900 p-1 transition-colors ${
                        isUpdating ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span
                      className={`mx-2 sm:mx-3 font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base transition-all duration-200 ${
                        isUpdating ? 'scale-110 text-purple-600' : ''
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      disabled={isUpdating}
                      className={`text-gray-600 hover:text-gray-900 p-1 transition-colors ${
                        isUpdating ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item)}
                    disabled={isUpdating}
                    className={`text-red-500 hover:text-red-700 p-1 mr-2 transition-colors ${
                      isUpdating ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t w-full">
          <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
            <span>الإجمالي:</span>
            <span className="transition-all duration-300">
              {calculateTotal()} ج.م
            </span>
          </div>
        </div>

        <div className="mt-6">
          {session ? (
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600 flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>وسيلة الدفع: PayPal</span>
              </div>
              <button
                onClick={handlePayNow}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                شراء الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600">
                يجب تسجيل الدخول لإكمال عملية الشراء
              </div>
              <Link href="/login">
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 text-base sm:text-lg flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  سجل الدخول لإكمال الطلب
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;