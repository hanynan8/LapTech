"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// قائمة المحافظات المصرية
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'القليوبية', 'الإسكندرية', 'البحيرة', 'المنوفية', 
  'الغربية', 'كفر الشيخ', 'الدقهلية', 'دمياط', 'الشرقية', 'الإسماعيلية',
  'بورسعيد', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف',
  'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد'
];

export default function CustomerRegister({ logoGradient = 'from-purple-600 to-blue-600' }) {
  // البيانات الأساسية
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneSecondary, setPhoneSecondary] = useState("");
  
  // بيانات العنوان
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [buildingNumber, setBuildingNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  
  // تفضيلات الشحن
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState("anytime");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const router = useRouter();

  // التحقق من صحة رقم الهاتف المصري
  const validatePhone = (phone) => {
    return /^01[0-2,5]{1}[0-9]{8}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // التحقق من البيانات الأساسية
    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setError("البيانات الأساسية مطلوبة (الاسم، البريد، كلمة المرور، والهاتف)");
      setCurrentStep(1);
      return;
    }

    // التحقق من صحة رقم الهاتف
    if (!validatePhone(phone.trim())) {
      setError("رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010، 011، 012، أو 015");
      setCurrentStep(1);
      return;
    }

    // التحقق من بيانات العنوان
    if (!governorate || !city.trim() || !district.trim() || !street.trim() || !buildingNumber.trim()) {
      setError("بيانات العنوان الأساسية مطلوبة");
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    try {
      // التحقق من وجود المستخدم
      const resUserExists = await fetch("api/auth/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("المستخدم موجود بالفعل بهذا البريد الإلكتروني أو رقم الهاتف");
        setLoading(false);
        return;
      }

      // تجهيز بيانات العميل
      const customerData = {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        phoneSecondary: phoneSecondary.trim() || undefined,
        addresses: [{
          type: 'home',
          governorate,
          city: city.trim(),
          district: district.trim(),
          street: street.trim(),
          buildingNumber: buildingNumber.trim(),
          floor: floor.trim() || undefined,
          apartment: apartment.trim() || undefined,
          landmark: landmark.trim() || undefined,
          isDefault: true
        }],
        preferredDeliveryTime,
        deliveryInstructions: deliveryInstructions.trim() || undefined
      };

      // إرسال البيانات للسيرفر
      const res = await fetch("api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (res.ok) {
        const form = e.target;
        form.reset();
        router.push("/login?message=account-created");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "فشل في إنشاء الحساب");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
      setError("حصل خطأ، حاول مرة أخرى لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="font-arabic min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border`}>
        {/* Gradient top accent */}
        <div className={`h-1 w-full bg-gradient-to-r ${logoGradient}`} />

        <div className="bg-white p-8 sm:p-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              إنشاء حساب عميل جديد
            </h2>
            <p className="text-sm text-gray-500">أدخل بياناتك الكاملة لإنشاء حسابك وتمكين خدمة التوصيل</p>
            
            {/* Step indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className="w-12 h-1 bg-gray-200">
                  <div className={`h-full bg-purple-600 transition-all duration-300 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className="w-12 h-1 bg-gray-200">
                  <div className={`h-full bg-purple-600 transition-all duration-300 ${currentStep >= 3 ? 'w-full' : 'w-0'}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2 text-xs text-gray-500">
              <span>البيانات الأساسية</span>
              <span className="mx-8">العنوان</span>
              <span>تفضيلات التوصيل</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Step 1: البيانات الأساسية */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">البيانات الأساسية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الاسم الكامل *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      required
                      placeholder="الاسم الأول واللقب"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">البريد الإلكتروني *</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      placeholder="example@domain.com"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">رقم الهاتف *</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">للتواصل عند التوصيل</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">رقم هاتف إضافي</label>
                    <input
                      value={phoneSecondary}
                      onChange={(e) => setPhoneSecondary(e.target.value)}
                      type="tel"
                      placeholder="01xxxxxxxxx (اختياري)"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">كلمة المرور *</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      placeholder="كلمة مرور قوية"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (name.trim() && email.trim() && password && phone.trim() && validatePhone(phone.trim())) {
                      setCurrentStep(2);
                      setError("");
                    } else {
                      setError("يرجى ملء جميع البيانات الأساسية بشكل صحيح");
                    }
                  }}
                  className="w-full mt-4 px-4 py-2 rounded-lg text-white font-semibold bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300"
                >
                  التالي - بيانات العنوان
                </button>
              </div>
            )}

            {/* Step 2: بيانات العنوان */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">عنوان التوصيل</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">المحافظة *</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      required
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      <option value="">اختر المحافظة</option>
                      {GOVERNORATES.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">المدينة/المركز *</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      type="text"
                      required
                      placeholder="اسم المدينة أو المركز"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الحي/المنطقة *</label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      type="text"
                      required
                      placeholder="اسم الحي أو المنطقة"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">اسم الشارع *</label>
                    <input
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      type="text"
                      required
                      placeholder="اسم الشارع"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">رقم العقار *</label>
                    <input
                      value={buildingNumber}
                      onChange={(e) => setBuildingNumber(e.target.value)}
                      type="text"
                      required
                      placeholder="رقم المبنى أو العقار"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">الطابق</label>
                    <input
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      type="text"
                      placeholder="رقم الطابق (اختياري)"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">رقم الشقة</label>
                    <input
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      type="text"
                      placeholder="رقم الشقة (اختياري)"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">معلم مميز قريب</label>
                    <input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      type="text"
                      placeholder="مثال: بجوار مسجد النور، أمام صيدلية العزبي"
                      className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">يساعد المندوب في الوصول بسهولة</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (governorate && city.trim() && district.trim() && street.trim() && buildingNumber.trim()) {
                        setCurrentStep(3);
                        setError("");
                      } else {
                        setError("يرجى ملء البيانات الأساسية للعنوان");
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-semibold bg-purple-600 hover:bg-purple-700"
                  >
                    التالي - ملاحظات إضافية
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: ملاحظات إضافية */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">ملاحظات إضافية</h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">ملاحظات للمندوب</label>
                  <textarea
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    rows="4"
                    placeholder="أي تعليمات خاصة للتوصيل (مثال: اتصل قبل الصعود، استخدم الجرس الأيمن، العقار بجوار الصيدلية)"
                    className="border border-gray-200 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                    maxLength="500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{deliveryInstructions.length}/500 حرف</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">معلومات مهمة:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• سيتم التواصل معك على رقم الهاتف المسجل قبل التوصيل</li>
                    <li>• يمكنك تعديل عنوانك وبياناتك لاحقاً من حسابك</li>
                    <li>• ملاحظاتك تساعد المندوب في الوصول بسهولة</li>
                  </ul>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    السابق
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : null}
                    إنشاء الحساب
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            <div id="form-error" aria-live="assertive" className="min-h-[1.25rem]">
              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
                  {error}
                </div>
              )}
            </div>

            <p className="text-sm text-center text-gray-600 mt-4">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-purple-600 font-medium hover:underline">
                سجل دخولك
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}