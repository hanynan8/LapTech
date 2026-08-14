'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react'; // استيراد useSession
import { ArrowRight, ShoppingCart } from 'lucide-react';

export default function PayPage() {
  const router = useRouter();
  const { data: session } = useSession(); // استرداد بيانات الجلسة
  const [paymentData, setPaymentData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [tx, setTx] = useState(null);
  const buttonsRef = useRef(null);
  const scriptRef = useRef(null);

  const EGP_TO_USD_RATE = 50; // حوالي 50 جنيه = 1 دولار (تحديث حسب السعر الحالي)
  const CART_API_URL = '/api/data?collection=carts';
  const PROFILE_API_URL = '/api/data?collection=profile';

  useEffect(() => {
    // جلب بيانات الدفع من localStorage
    const storedPaymentData = localStorage.getItem('paymentData');
    if (storedPaymentData) {
      try {
        const parsedData = JSON.parse(storedPaymentData);
        setPaymentData(parsedData);
      } catch (error) {
        console.error('Error parsing payment data:', error);
        router.push('/cart');
      }
    } else {
      // إذا لم توجد بيانات دفع، إرجاع للسلة
      router.push('/cart');
    }
  }, [router]);

  useEffect(() => {
    // لا تعمل على الخادم أو إذا لم توجد بيانات دفع
    if (typeof window === 'undefined' || !paymentData) return;

    // إذا السكربت محمّل فعلاً - رندَر الأزرار مباشرة
    if (window.paypal) {
      renderButtons();
      return () => cleanup();
    }

    // أضف سكربت PayPal مع CLIENT ID من env
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
    s.async = true;
    s.onload = () => renderButtons();
    s.onerror = () => {
      console.error('Failed to load PayPal SDK');
      setStatus('error');
    };
    document.body.appendChild(s);
    scriptRef.current = s;

    // تنظيف عند الخروج
    return () => cleanup();
  }, [paymentData]);

  const cleanup = () => {
    try {
      if (
        buttonsRef.current &&
        typeof buttonsRef.current.close === 'function'
      ) {
        buttonsRef.current.close();
      }
    } catch (e) {
      /* ignore */
    }

    if (scriptRef.current) {
      try {
        scriptRef.current.remove(); // احذف العنصر من DOM
      } catch (e) {
        /* ignore */
      }
      scriptRef.current = null;
    }
  };

  // دالة حفظ الطلب في profile collection
  const saveOrderToProfile = async (orderData) => {
    try {
      const orderToSave = {
        email: session?.user?.email || 'guest',
        userId: session?.user?.id || null,
        orderId: orderData.id || orderData.orderID,
        items: paymentData.items,
        total: paymentData.total,
        totalUSD: (paymentData.total / EGP_TO_USD_RATE).toFixed(2),
        exchangeRate: EGP_TO_USD_RATE,
        paymentMethod: 'PayPal',
        status: 'completed',
        paypalDetails: orderData,
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const response = await fetch(PROFILE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save order to profile');
      }

      const savedOrder = await response.json();
      console.log('Order saved to profile:', savedOrder);
      return savedOrder;
    } catch (error) {
      console.error('Error saving order to profile:', error);
      throw error;
    }
  };

  // دالة تصفية الكارت (مثل الكود المرفوع)
  const clearCart = async () => {
    if (session) {
      try {
        // Fetch all user's items to get their _ids
        const response = await fetch(CART_API_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch cart items for deletion');
        }
        const data = await response.json();
        const userItems = data.filter(
          (item) => item.email === session.user.email
        );
        
        // Delete each item
        for (const cartItem of userItems) {
          const deleteResponse = await fetch(
            `${CART_API_URL}&id=${cartItem._id}`,
            {
              method: 'DELETE',
            }
          );
          if (!deleteResponse.ok) {
            throw new Error(`Failed to delete item ${cartItem._id}`);
          }
        }
        
        // إضافة حدث التحديث العام
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log('Cart cleared successfully from database');
      } catch (err) {
        console.error('Error clearing cart from database:', err);
        throw err;
      }
    } else {
      try {
        // Clear localStorage
        localStorage.removeItem('cart');
        // إضافة حدث التحديث العام
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        console.log('Cart cleared successfully from localStorage');
      } catch (err) {
        console.error('Error clearing cart from localStorage:', err);
        throw err;
      }
    }
  };

  const renderButtons = () => {
    if (!window.paypal || !paymentData) {
      setStatus('error');
      return;
    }

    // تحويل السعر من جنيه مصري إلى دولار (تقريبي)
    const priceInUSD = (paymentData.total / EGP_TO_USD_RATE).toFixed(2);

    buttonsRef.current = window.paypal.Buttons({
      createOrder: async (data, actions) => {
        try {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              price: parseFloat(priceInUSD),
              currency: 'USD',
              productName: `طلب من المتجر - ${paymentData.items.length} منتج`,
              items: paymentData.items,
              originalTotal: paymentData.total,
              originalCurrency: 'EGP',
              exchangeRate: EGP_TO_USD_RATE,
            }),
          });

          const raw = await res.text();
          let dataJson = null;
          try {
            dataJson = raw ? JSON.parse(raw) : null;
          } catch (e) {
            dataJson = null;
          }

          console.log('create-order response status:', res.status);
          console.log('create-order raw body:', raw);
          if (!res.ok) {
            console.error('create-order failed:', res.status, raw);
            throw new Error(`create-order failed: ${res.status}`);
          }

          const orderId =
            (dataJson &&
              (dataJson.id || dataJson.orderID || dataJson.orderId)) ||
            (raw && raw.trim() ? raw.trim() : null);

          if (!orderId) {
            console.error('No order id found in create-order response', {
              status: res.status,
              body: raw,
              json: dataJson,
            });
            throw new Error('Expected an order id to be passed');
          }

          return String(orderId);
        } catch (err) {
          console.error('create-order error:', err);
          setStatus('error');
          throw err;
        }
      },

      onApprove: async (data, actions) => {
        try {
          // 1. التقاط الطلب من PayPal
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderID: data.orderID,
              email: session?.user?.email || null,
              userId: session?.user?.id || null,
            }),
          });
          const details = await res.json();
          
          // 2. حفظ الطلب في profile collection
          await saveOrderToProfile(details);
          
          // 3. تصفية الكارت
          await clearCart();
          
          // 4. تحديث الحالة
          setStatus('success');
          setTx(details);

          // 5. مسح بيانات الدفع من localStorage بعد النجاح
          localStorage.removeItem('paymentData');

          console.log('Payment completed successfully, order saved and cart cleared');
        } catch (err) {
          console.error('Error in payment completion process:', err);
          setStatus('error');
        }
      },

      onCancel: () => {
        setStatus('cancelled');
      },

      onError: (err) => {
        console.error('PayPal Buttons error:', err);
        setStatus('error');
      },
    });

    buttonsRef.current.render('#paypal-button-container').catch((err) => {
      console.error('Failed to render PayPal Buttons:', err);
      setStatus('error');
    });
  };

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الدفع...</p>
        </div>
      </div>
    );
  }

  const priceInUSD = paymentData
    ? (paymentData.total / EGP_TO_USD_RATE).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/cart')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors ml-3"
          >
            <ArrowRight className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">إتمام الدفع</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Order Summary */}
          <div className="border-b pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <ShoppingCart className="w-5 h-5 ml-2" />
              ملخص الطلب
            </h2>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {paymentData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    {(item.price * item.quantity).toLocaleString()} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold mb-2">
            <span>الإجمالي:</span>
            <span className="text-purple-600">
              {paymentData?.total.toLocaleString()} ج.م
            </span>
          </div>

          {/* عرض السعر بالدولار مع سعر الصرف */}
          <div className="text-sm text-gray-500 text-center mb-4 bg-gray-50 p-2 rounded">
            <div>
              المبلغ بالدولار: <strong>${priceInUSD} USD</strong>
            </div>
            <div className="text-xs mt-1">
              سعر الصرف: 1 USD = {EGP_TO_USD_RATE} ج.م
            </div>
          </div>

          {/* PayPal Button Container */}
          {status === 'idle' && (
            <div>
              <p className="text-sm text-gray-600 text-center mb-4">
                اختر وسيلة الدفع المفضلة لديك
              </p>
              <div id="paypal-button-container" />
            </div>
          )}

          {/* Status Messages */}
          {status === 'success' && (
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                تم الدفع بنجاح!
              </h3>
              <p className="text-gray-600 mb-4">
                شكراً لك، تم إتمام عملية الدفع بنجاح وحفظ الطلب في حسابك
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => router.push('/profile#orders')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  عرض الطلبات
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>

              {/* تفاصيل المعاملة */}
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  <span className='text-red-600'>عرض تفاصيل المعاملة</span>( يفضل اخذ تفاصيل المعامله اسكرين شوت وارساله لنا علي الواتس علي رقم 01201061216 لتوصيل اسرع )
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                  {JSON.stringify(tx, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {status === 'cancelled' && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">
                تم إلغاء الدفع
              </h3>
              <p className="text-gray-600 mb-4">لم يتم إتمام عملية الدفع</p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors ml-3"
              >
                المحاولة مرة أخرى
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                العودة للسلة
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                حدث خطأ في عملية الدفع
              </h3>
              <p className="text-gray-600 mb-4">
                عذراً، حدثت مشكلة أثناء معالجة الدفع
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors ml-3"
              >
                المحاولة مرة أخرى
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                العودة للسلة
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 text-center">
            🔒 جميع المعاملات محمية بتشفير SSL وتتم معالجتها بواسطة PayPal
          </p>
        </div>
      </div>
    </div>
  );
}