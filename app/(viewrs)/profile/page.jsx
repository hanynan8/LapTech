'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  Home,
  CreditCard,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';

export default function Profile() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const usersResponse = await fetch(
          'https://restaurant-back-end.vercel.app/api/data?collection=users',
          { cache: 'no-store' }
        );
        const usersData = await usersResponse.json();

        const foundUser = usersData.find(
          (user) => user.email === session.user.email
        );
        setUserData(foundUser || null);

        const ordersResponse = await fetch(
          'https://restaurant-back-end.vercel.app/api/data?collection=profile',
          { cache: 'no-store' }
        );
        const allOrders = await ordersResponse.json();

        const userOrders = allOrders.filter(
          (order) => order.email === session.user.email
        );
        setOrdersData(userOrders || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const formatPrice = (num) => {
    if (num == null) return '—';
    try {
      return new Intl.NumberFormat('ar-EG').format(num);
    } catch {
      return String(num);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(false);
    signOut({ callbackUrl: '/' });
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-gray-50 w-full" dir="rtl">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-xl font-semibold text-gray-800 mb-3">يجب تسجيل الدخول للوصول للملف الشخصي</h1>
            <Link href="/login">
              <button className="mt-2 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">تسجيل الدخول</button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 w-full" dir="rtl">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 w-full" dir="rtl">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-red-500">خطأ: {error}</div>
          </div>
        </div>
      </main>
    );
  }

  const totalSpent = ordersData.reduce((sum, order) => sum + (order?.total || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 w-full" dir="rtl">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="bg-indigo-50 p-2 sm:p-3 rounded-full flex-shrink-0">
              <User className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">الملف الشخصي</h1>
              <p className="text-sm text-gray-600 truncate">مرحباً، {session?.user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href="/">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center">
                <Home className="w-4 h-4" /> الرئيسية
              </button>
            </Link>
          </div>
        </header>

        {/* --- User Information (full width, my design) --- */}
        {userData && (
          <section className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">بيانات المستخدم</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <InfoRow icon={<User className="w-5 h-5 text-indigo-600" />} label="الاسم" value={userData.name} />
              <InfoRow icon={<Mail className="w-5 h-5 text-green-600" />} label="البريد الإلكتروني" value={userData.email} />
              <InfoRow icon={<Phone className="w-5 h-5 text-purple-600" />} label="رقم الهاتف" value={userData.phone || 'غير محدد'} />
              <InfoRow icon={<CreditCard className="w-5 h-5 text-orange-600" />} label="طريقة الدفع المفضلة" value={userData.preferredPaymentMethod === 'cash' ? 'نقدي' : userData.preferredPaymentMethod || 'غير محدد'} />
            </div>

            {/* --- Orders Section (full width, accented) --- */}
            <section className="bg-gradient-to-l from-indigo-100 to-white rounded-xl shadow p-0 mb-6 overflow-hidden mt-4 sm:mt-6">
              <div
                className="p-3 sm:p-4 bg-indigo-50/80 cursor-pointer"
                onClick={() => setShowOrders((s) => !s)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setShowOrders((s) => !s);
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="bg-indigo-100 p-2 sm:p-3 rounded-md flex-shrink-0">
                      <Package className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-indigo-700">طلباتي</h3>
                      <p className="text-xs text-indigo-600/80">عدد الطلبات: {ordersData.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-sm font-medium text-indigo-700">{formatPrice(totalSpent)} ج.م</div>
                    <div className="p-1 sm:p-2 bg-white rounded-full shadow-sm">
                      {showOrders ? <ChevronUp className="w-3 sm:w-4 h-3 sm:h-4 text-indigo-600" /> : <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4 text-indigo-600" />}
                    </div>
                  </div>
                </div>
              </div>

              {showOrders && (
                <div className="p-3 sm:p-4 bg-white">
                  {ordersData.length === 0 ? (
                    <div className="text-center py-6">
                      <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <h4 className="font-medium text-gray-800">لا توجد طلبات</h4>
                      <p className="text-sm text-gray-600">لم تقم بأي طلبات حتى الآن</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ordersData.map((order) => (
                        <article key={order._id} className="border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3 cursor-pointer"
                            onClick={() => toggleOrder(order._id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') toggleOrder(order._id);
                            }}
                          >
                            <div className="w-full sm:w-auto">
                              <div className="text-xs text-gray-500">رقم الطلب</div>
                              <div className="font-medium text-sm text-gray-800">{order._id.slice(-8)}</div>
                              <div className="mt-2 text-xs text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> <span>{formatDate(order.orderDate)}</span></div>
                            </div>

                            <div className="text-right w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                              <div>
                                <div className="text-sm font-medium text-indigo-700">{formatPrice(order.total)} {order.items?.[0]?.currency}</div>
                                <div className="mt-2">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                    {order.status === 'completed' ? 'مكتمل' : order.status}
                                  </span>
                                </div>
                              </div>
                              <div className="p-1 sm:p-2 bg-gray-100 rounded-full shadow-sm">
                                {expandedOrders.has(order._id) ? <ChevronUp className="w-3 sm:w-4 h-3 sm:h-4 text-indigo-600" /> : <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4 text-indigo-600" />}
                              </div>
                            </div>
                          </div>

                          {expandedOrders.has(order._id) && (
                            <>
                              <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3">
                                <h5 className="text-sm font-medium text-gray-800 mb-2">المنتجات</h5>
                                <div className="space-y-2">
                                  {order.items?.map((item) => (
                                    <div key={item._id} className="flex items-start gap-3 p-2 bg-white rounded-lg">
                                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-white flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                                      </div>
                                      <div className="flex-grow min-w-0">
                                        <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-600 mt-1 gap-1 sm:gap-0">
                                          <span>الكمية: {item.quantity}</span>
                                          <span className="font-medium">{formatPrice(item.price)} {item.currency}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="text-xs text-gray-600">طريقة الدفع: <span className="font-medium text-gray-800">{order.paymentMethod}</span></div>
                            </>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {userData.addresses && userData.addresses.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h3 className="text-sm font-medium text-gray-800 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> العناوين المحفوظة</h3>
                <div className="space-y-3">
                  {userData.addresses.map((address, index) => (
                    <div key={index} className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                      <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">{address.type === 'home' ? 'المنزل' : address.type}</span>
                        </div>
                        {address.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">افتراضي</span>}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>{address.governorate}, {address.city}, {address.district}</div>
                        <div>{address.street}, مبنى {address.buildingNumber}, الطابق {address.floor}, شقة {address.apartment}</div>
                        {address.landmark && <div className="text-blue-700">علامة مميزة: {address.landmark}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- Stats Cards (after orders) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <StatCard title="إجمالي الطلبات" value={ordersData.length} icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />} />
          <StatCard title="إجمالي الإنفاق" value={`${formatPrice(totalSpent)} ج.م`} icon={<DollarSign className="w-5 h-5 text-green-600" />} />
          <StatCard title="تاريخ التسجيل" value={userData ? new Date(userData.createdAt).toLocaleDateString('ar-EG') : 'غير متاح'} icon={<Calendar className="w-5 h-5 text-purple-600" />} />
        </div>

        {/* --- Sign Out Button --- */}
        <div className="bg-white rounded-xl shadow p-4 text-center mb-6">
          <h3 className="font-medium text-gray-800 mb-3">إنهاء الجلسة</h3>
          <button onClick={() => setShowSignOutModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm">تسجيل الخروج</button>
        </div>

        {/* Sign Out Modal */}
        {showSignOutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md">
              <div className="text-center">
                <div className="bg-red-100 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">تأكيد تسجيل الخروج</h3>
                <p className="text-sm text-gray-600 mb-4">هل أنت متأكد من أنك تريد تسجيل الخروج من حسابك؟</p>

                <div className="flex gap-3 justify-center flex-col sm:flex-row">
                  <button onClick={() => setShowSignOutModal(false)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm w-full sm:w-auto">إلغاء</button>
                  <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto">تأكيد تسجيل الخروج</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
      <div className="p-2 rounded-lg bg-white flex-shrink-0">{icon}</div>
      <div className="flex-grow min-w-0 text-right">
        <p className="text-xs text-gray-600">{label}</p>
        <p className="font-medium text-sm text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4 text-center">
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
        <div className="bg-white p-2 rounded-md">{icon}</div>
      </div>
      <p className="text-xs text-gray-600">{title}</p>
      <p className="font-medium text-gray-800 mt-1 text-sm">{value}</p>
    </div>
  );
}