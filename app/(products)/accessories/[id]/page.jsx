
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = true;

export default async function ProductDetailsPage({ params }) {
  const data = [
  {
    "_id": "68aff2f5eb5a7cdc921b2b95",
    "pageTitle": "عالم الاكسسوارات التقنية",
    "pageSubtitle": "اكتشف أحدث الاكسسوارات التقنية لتعزيز تجربتك الرقمية",
    "categories": [
      {
        "id": "all",
        "name": "جميع الاكسسوارات",
        "icon": "smartphone",
        "color": "from-purple-600 to-blue-600"
      },
      {
        "id": "headphones",
        "name": "سماعات",
        "icon": "headphones",
        "color": "from-blue-600 to-cyan-600"
      },
      {
        "id": "mouse",
        "name": "فأرة الكمبيوتر",
        "icon": "mouse",
        "color": "from-green-600 to-emerald-600"
      },
      {
        "id": "keyboard",
        "name": "لوحة المفاتيح",
        "icon": "keyboard",
        "color": "from-red-600 to-pink-600"
      },
      {
        "id": "cables",
        "name": "كابلات وشواحن",
        "icon": "cable",
        "color": "from-orange-600 to-yellow-600"
      },
      {
        "id": "camera",
        "name": "كاميرات ومعدات",
        "icon": "camera",
        "color": "from-indigo-600 to-purple-600"
      },
      {
        "id": "gaming",
        "name": "اكسسوارات الألعاب",
        "icon": "gamepad2",
        "color": "from-pink-600 to-rose-600"
      },
      {
        "id": "smartwatch",
        "name": "ساعات ذكية",
        "icon": "watch",
        "color": "from-teal-600 to-cyan-600"
      }
    ],
    "filters": {
      "sortOptions": [
        {
          "value": "name",
          "label": "الاسم"
        },
        {
          "value": "price-low",
          "label": "السعر: من الأقل للأعلى"
        },
        {
          "value": "price-high",
          "label": "السعر: من الأعلى للأقل"
        },
        {
          "value": "rating",
          "label": "التقييم"
        }
      ]
    },
    "products": [
      {
        "id": 1,
        "name": "سماعة بلوتوث Sony WH-1000XM5",
        "category": "headphones",
        "price": 1299,
        "currency": "ر.س",
        "originalPrice": 1499,
        "discount": 13,
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        "badge": "الأكثر مبيعاً",
        "specs": {
          "connectivity": "Bluetooth 5.2",
          "battery": "30 ساعة",
          "features": "إلغاء الضوضاء التكيفي"
        },
        "details": {
          "description": "سماعات رأس لاسلكية متطورة مع تقنية إلغاء الضوضاء الرائدة، توفر تجربة صوتية استثنائية وراحة طويلة الأمد",
          "brand": "Sony",
          "model": "WH-1000XM5",
          "weight": "250 جرام",
          "color": "أسود",
          "noiseCancellation": "نعم",
          "microphone": "مدمج مع تقنية واضحة للكلام",
          "bluetoothRange": "10 أمتار",
          "chargingTime": "3 ساعات",
          "standbyTime": "200 ساعة",
          "warranty": "سنتان",
          "compatibility": "جميع أجهزة البلوتوث",
          "inTheBox": "سماعات، كابل شحن، كابل صوت، حافظة",
          "additionalImages": [
            "https://images.unsplash.com/photo-1599669454699-248893623464?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 2,
        "name": "سماعة أذن AirPods Pro 2",
        "category": "headphones",
        "price": 999,
        "currency": "ر.س",
        "rating": 4.7,
        "image": "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&h=400&fit=crop",
        "specs": {
          "connectivity": "Bluetooth 5.3",
          "battery": "6 ساعات (مع الشحن اللاسلكي)",
          "features": "مقاومة الماء والعرق"
        },
        "details": {
          "description": "سماعات أذن لاسلكية من Apple بتقنية إلغاء الضوضاء النشط ومقاومة الماء، تصميم مريح وجودة صوت استثنائية",
          "brand": "Apple",
          "model": "AirPods Pro 2",
          "weight": "5.4 جرام لكل سماعة",
          "color": "أبيض",
          "noiseCancellation": "نعم (نشط)",
          "microphone": "ميكروفون مدمج مع تقنية التحدث تلقائياً",
          "bluetoothRange": "15 متر",
          "chargingTime": "1 ساعة",
          "standbyTime": "24 ساعة مع علبة الشحن",
          "warranty": "سنة واحدة",
          "compatibility": "أجهزة Apple وأندرويد",
          "inTheBox": "سماعات، علبة شحن، كابل USB-C، نصائح سيليكون متعددة المقاسات",
          "additionalImages": [
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1550660115-2f78d1adaf56?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 3,
        "name": "فأرة ألعاب Logitech G Pro X",
        "category": "mouse",
        "price": 299,
        "currency": "ر.س",
        "rating": 4.7,
        "image": "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
        "badge": "للمحترفين",
        "specs": {
          "dpi": "25,600 DPI",
          "buttons": "5 أزرار قابلة للبرمجة",
          "connectivity": "سلكي/لاسلكي"
        },
        "details": {
          "description": "فأرة ألعاب احترافية مصممة للاعبين المحترفين، تتميز بدقة عالية واستجابة سريعة وتصميم مريح",
          "brand": "Logitech",
          "model": "G Pro X",
          "weight": "80 جرام (قابل للتعديل)",
          "color": "أسود",
          "sensor": "HERO 25K",
          "pollingRate": "1000 هرتز",
          "lighting": "RGB إضاءة",
          "battery": "48 ساعة (وضع بدون إضاءة)",
          "warranty": "سنتان",
          "compatibility": "Windows, macOS",
          "inTheBox": "فأرة، مستقبل لاسلكي، كابل شحن، أوزان إضافية",
          "additionalImages": [
            "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 4,
        "name": "لوحة مفاتيح ميكانيكية Keychron K2",
        "category": "keyboard",
        "price": 449,
        "currency": "ر.س",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=400&fit=crop",
        "badge": "اختيار المحررين",
        "specs": {
          "switches": "Gateron Blue Switches",
          "backlight": "RGB LED",
          "connectivity": "سلكي/بلوتوث"
        },
        "details": {
          "description": "لوحة مفاتيح ميكانيكية لاسلكية مدمجة مع إضاءة RGB، مثالية للعمل والألعاب",
          "brand": "Keychron",
          "model": "K2 Version 2",
          "layout": "75%",
          "switches": "Gateron Blue (قابلة للتبديل)",
          "keycaps": "ABS Double-shot",
          "battery": "4000mAh",
          "batteryLife": "3 أسابيع (بدون إضاءة)",
          "connectivity": "Bluetooth 5.1 + USB-C",
          "weight": "700 جرام",
          "warranty": "18 شهر",
          "compatibility": "Windows, macOS, Android, iOS",
          "inTheBox": "لوحة مفاتيح، كابل USB-C، مفتاح شداد، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1626887228582-82f2343c34df?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1601445638532-3e6c5d8a93b3?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 5,
        "name": "شاحن لاسلكي Anker PowerWave",
        "category": "cables",
        "price": 149,
        "currency": "ر.س",
        "rating": 4.4,
        "image": "https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=600&h=400&fit=crop",
        "specs": {
          "power": "15W للهواتف الداعمة، 10W للهواتف الأخرى",
          "compatibility": "Qi Compatible",
          "features": "شحن سريع لاسلكي"
        },
        "details": {
          "description": "شاحن لاسلكي سريع مع تقنية التبريد النشط، يدعم الشحن السريع لمعظم الهواتف الذكية",
          "brand": "Anker",
          "model": "PowerWave 15W",
          "input": "5V/2A أو 9V/1.67A",
          "output": "15W كحد أقصى",
          "efficiency": "شحن حتى 50% في 30 دقيقة",
          "cooling": "مروحة تبريد نشطة",
          "indicator": "LED للإشعار",
          "weight": "150 جرام",
          "warranty": "18 شهر",
          "compatibility": "جميع أجهزة Qi اللاسلكية",
          "inTheBox": "شاحن لاسلكي، محول طاقة، كابل USB-C، دليل الاستخدام",
          "additionalImages": [
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 6,
        "name": "كاميرا ويب Logitech C920",
        "category": "camera",
        "price": 379,
        "currency": "ر.س",
        "rating": 4.7,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=400&fit=crop",
        "badge": "جودة HD",
        "specs": {
          "resolution": "1080p/30fps، 720p/30fps",
          "fps": "30 إطار بالثانية",
          "features": "تركيز تلقائي، ميكروفون ستريو مدمج"
        },
        "details": {
          "description": "كاميرا ويب عالية الدقة للمكالمات الجماعية والبث المباشر، مع ميكروفون مدمج وعدسة auto-focus",
          "brand": "Logitech",
          "model": "C920 HD Pro",
          "sensor": "Full HD glass lens",
          "microphone": "ميكروفون ستريو مدمج مع تقليل الضوضاء",
          "focus": "AutoFocus تلقائي",
          "compatibility": "Windows, macOS, Chrome OS",
          "mount": "قابلة للتثبيت على الشاشة أو حامل ثلاثي",
          "connection": "USB 2.0",
          "weight": "162 جرام",
          "warranty": "سنتان",
          "inTheBox": "كاميرا ويب، غطاء عدسة، كابل USB، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1565598621680-94c48b04e56f?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1572953109213-3be62398ff95?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1592921870784-2a4e5689462f?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 7,
        "name": "يد تحكم Xbox Wireless",
        "category": "gaming",
        "price": 269,
        "currency": "ر.س",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
        "badge": "الأصلية",
        "specs": {
          "connectivity": "Bluetooth/USB-C",
          "battery": "40 ساعة",
          "features": "اهتزاز، منفذ سماعة رأس"
        },
        "details": {
          "description": "يد تحكم لاسلكية رسمية من Xbox مع تصميم مريح ودعم للاهتزاز والتوصيل اللاسلكي",
          "brand": "Microsoft",
          "model": "Xbox Wireless Controller",
          "battery": "بطارية قابلة لإعادة الشحن (AA اختياري)",
          "buttons": "12 زر قابلة للبرمجة",
          "connectivity": "Bluetooth 4.0، USB-C",
          "range": "6 أمتار",
          "weight": "280 جرام",
          "vibration": "اهتزاز مزدوج",
          "audio": "منفذ 3.5mm لسماعات الرأس",
          "warranty": "سنة واحدة",
          "compatibility": "Xbox, Windows, Android",
          "inTheBox": "يد تحكم، كابل USB-C، بطاريات، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1605901309581-48b69256a7cd?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1605901309581-48b69256a7cd?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 8,
        "name": "Apple Watch Series 9",
        "category": "smartwatch",
        "price": 1699,
        "currency": "ر.س",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=400&fit=crop",
        "badge": "الأحدث",
        "specs": {
          "display": "Retina LTPO OLED 45mm",
          "battery": "18 ساعة",
          "features": "GPS + Cellular، مقاومة الماء"
        },
        "details": {
          "description": "ساعة ذكية متطورة من Apple مع شاشة دائمة، تتبع صحي متقدم واتصال خلوي مدمج",
          "brand": "Apple",
          "model": "Watch Series 9",
          "display": "Always-On Retina display",
          "processor": "S9 SiP",
          "storage": "32GB",
          "waterResistance": "50 متر",
          "healthFeatures": "تخطيط القلب، قياس الأكسجين، تتبع النوم",
          "connectivity": "Wi-Fi، Bluetooth 5.3، LTE",
          "batteryLife": "حتى 18 ساعة",
          "charging": "شحن لاسلكي",
          "weight": "32 جرام (حالة الألومنيوم)",
          "warranty": "سنة واحدة",
          "compatibility": "iPhone 8 أو أحدث",
          "inTheBox": "ساعة، حزام، شاحن لاسلكي، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1579586337278-3f436f25d4d9?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 9,
        "name": "بنك طاقة Anker PowerCore 26800",
        "category": "cables",
        "price": 299,
        "currency": "ر.س",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1609557927087-f9cf8e88de18?w=600&h=400&fit=crop",
        "badge": "سعة عالية",
        "specs": {
          "capacity": "26800mAh",
          "ports": "3 منافذ USB",
          "features": "شحن سريع Power Delivery"
        },
        "details": {
          "description": "بنك طاقة عالي السعة مع تقنية الشحن السريع، يمكنه شحن عدة أجهزة في نفس الوقت",
          "brand": "Anker",
          "model": "PowerCore 26800",
          "capacity": "26800mAh",
          "input": "5V/3A",
          "output": "5V/3A (إجمالي)",
          "ports": "3 منافذ USB-A",
          "technology": "PowerIQ و VoltageBoost",
          "chargingSpeed": "شحن iPhone 8 مرات",
          "weight": "570 جرام",
          "dimensions": "170x76x36 ملم",
          "warranty": "18 شهر",
          "compatibility": "جميع أجهزة USB",
          "inTheBox": "بنك طاقة، كابل شحن، حافظة، دليل الاستخدام",
          "additionalImages": [
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 10,
        "name": "سماعة ألعاب SteelSeries Arctis 7",
        "category": "gaming",
        "price": 699,
        "currency": "ر.س",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop",
        "specs": {
          "connectivity": "لاسلكي 2.4Ghz",
          "battery": "24 ساعة",
          "features": "صوت محيطي DTS 7.1"
        },
        "details": {
          "description": "سماعات ألعاب لاسلكية مع صوت محيطي عالي الجودة وراحة استثنائية للجلسات الطويلة",
          "brand": "SteelSeries",
          "model": "Arctis 7",
          "driver": "40mm",
          "frequency": "20-20000 هرتز",
          "microphone": "ميكروفون قابلسحب مع ClearCast",
          "batteryLife": "24 ساعة متواصلة",
          "charging": "USB-C",
          "weight": "357 جرام",
          "connectivity": "لاسلكي 2.4Ghz + 3.5mm",
          "warranty": "سنتان",
          "compatibility": "PC, PS4, PS5, Switch, Mobile",
          "inTheBox": "سماعات، مستقبل لاسلكي، كابل شحن، كابل صوت، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1599669454699-248893623464?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 11,
        "name": "محطة شحن لاسلكي 3 في 1",
        "category": "cables",
        "price": 399,
        "currency": "ر.س",
        "rating": 4.5,
        "image": "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=600&h=400&fit=crop",
        "specs": {
          "devices": "3 أجهزة في وقت واحد",
          "power": "15W لكل جهاز",
          "features": "تصميم عمودي، شحن سريع"
        },
        "details": {
          "description": "محطة شحن لاسلكية متعددة الأجهزة تشحن الساعة والهاتف وسماعات الأذن في نفس الوقت",
          "brand": "Belkin",
          "model": "3-in-1 Wireless Charger",
          "chargingPower": "15W للهاتف، 5W للساعة، 5W للسماعات",
          "technology": "Qi wireless charging",
          "design": "تصميم عمودي يوفر مساحة",
          "indicator": "LED للشحن",
          "weight": "300 جرام",
          "input": "USB-C 9V/2.7A",
          "warranty": "سنتان",
          "compatibility": "iPhone, Apple Watch, AirPods",
          "inTheBox": "محطة شحن، محول طاقة، كابل USB-C، دليل الاستخدام",
          "additionalImages": [
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1609091839311-d5365f2e0c5a?w=600&h=400&fit=crop"
          ]
        }
      },
      {
        "id": 12,
        "name": "مكبر صوت JBL Charge 5",
        "category": "headphones",
        "price": 549,
        "currency": "ر.س",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop",
        "badge": "مقاوم للماء",
        "specs": {
          "battery": "20 ساعة",
          "power": "30W",
          "features": "IP67 مقاوم للماء والغبار"
        },
        "details": {
          "description": "مكبر صوت محمول قوي مع صوت غني وميزة الشحن العكسي، مقاوم للماء والغبار",
          "brand": "JBL",
          "model": "Charge 5",
          "driver": "50mm x 2",
          "output": "30W",
          "battery": "7500mAh (شحن الأجهزة)",
          "batteryLife": "20 ساعة",
          "waterproof": "IP67 (مقاوم للماء والغبار)",
          "connectivity": "Bluetooth 5.1",
          "weight": "960 جرام",
          "colors": "أسود، أزرق، أحمر",
          "warranty": "سنة واحدة",
          "compatibility": "جميع أجهزة Bluetooth",
          "inTheBox": "مكبر صوت، كابل USB-C، كابل 3.5mm، دليل المستخدم",
          "additionalImages": [
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop"
          ]
        }
      }
    ]
  }
];

  // جلب المنتج حسب id
  async function fetchProductById(id) {
    return data[0].products.find(p => p.id === Number(id)) || null;
  }

  // جلب مجموعة منتجات حسب فئة (fallback)
  async function fetchByCategory(category, limit = 12) {
    return data[0].products.filter(p => p.category === category).slice(0, limit);
  }

  const product = await fetchProductById(params.id);
  if (!product) notFound();

  // RELATED PRODUCTS - البحث في نفس الفئة
  const DESIRED_RELATED_COUNT = 12;
  let relatedProducts = [];

  if (product.category) {
    const candidates = await fetchByCategory(
      product.category,
      DESIRED_RELATED_COUNT * 2
    );
    const filtered = Array.isArray(candidates)
      ? candidates.filter((p) => p && p.id !== product.id)
      : [];

    relatedProducts = filtered.slice(0, DESIRED_RELATED_COUNT);
  }

  function formatPrice(num) {
    if (num == null) return '—';
    try {
      return new Intl.NumberFormat('ar-EG').format(num);
    } catch {
      return String(num);
    }
  }

  function renderSpecCard(
    title,
    items,
    bgColor = 'bg-gray-50',
    textColor = 'text-gray-800'
  ) {
    if (!items || Object.keys(items).length === 0) return null;

    return (
      <div className={`p-6 rounded-2xl ${bgColor} shadow-sm`}>
        <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
          <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(items).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-4 rounded-xl shadow-xs border border-gray-100"
            >
              <div className="text-sm font-medium text-gray-500 mb-1 capitalize">
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </div>
              <div className={`font-semibold ${textColor}`}>
                {Array.isArray(value) ? (
                  <ul className="space-y-1">
                    {value.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm bg-gray-50 px-3 py-1.5 rounded-lg"
                      >
                        {typeof item === 'object'
                          ? JSON.stringify(item)
                          : String(item)}
                      </li>
                    ))}
                  </ul>
                ) : typeof value === 'object' && value !== null ? (
                  <div className="space-y-2">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <div
                        key={subKey}
                        className="text-sm bg-gray-50 px-3 py-1.5 rounded-lg"
                      >
                        <span className="font-medium">{subKey}:</span>{' '}
                        {String(subValue)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>{String(value)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderListCard(
    title,
    items,
    bgColor = 'bg-gray-50',
    textColor = 'text-gray-800'
  ) {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
      <div className={`p-6 rounded-2xl ${bgColor} shadow-sm`}>
        <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
          <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
          {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex items-center"
            >
              <div className="w-3 h-3 bg-purple-500 rounded-full ml-2"></div>
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // استخراج البيانات بشكل صحيح
  const specs = product.specs || {};
  const details = product.details || {};
  const components = product.components || [];
  const benchmarks = product.benchmarks || {};
  const stockStatus = details.stockStatus || 'In Stock';
  const isAvailable =
    stockStatus === 'In Stock' || stockStatus === 'Limited';

  // تحديد مصفوفة الصور
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image, ...(details.additionalImages || [])]
      : [];

  // فلترة التفاصيل لاستبعاد الوصف والصور الإضافية
  const filteredDetails = { ...details };
  delete filteredDetails.description;
  delete filteredDetails.additionalImages;

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      dir="rtl"
    >
      <style>{`
        .thumb-selected { 
          outline: 3px solid rgba(99,102,241,0.15); 
          transform: scale(1.03); 
          border-radius: 12px;
        }
        
        .gallery-arrow {
          background: rgba(255,255,255,0.95);
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          border: 1px solid rgba(0,0,0,0.06);
          font-weight: 700;
          color: rgba(34,34,34,0.95);
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          z-index: 20;
        }
        
        .thumbnail-btn { 
          border: none; 
          background: transparent; 
          padding: 0; 
          cursor: pointer; 
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .thumbnail-btn:hover {
          transform: translateY(-2px);
        }
        
        .sticky-cta {
          position: sticky;
          bottom: 24px;
          z-index: 30;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .lightbox-img {
          border-radius: 0;
          box-shadow: 0 12px 60px rgba(0,0,0,0.7);
          transition: transform 160ms ease;
          transform-origin: center center;
          cursor: grab;
          transform: scale(1) translate(0px, 0px);
        }

        .availability-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        .available {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .unavailable {
          background-color: #fee2e2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .limited {
          background-color: #fef3c7;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        @media (max-width: 768px) {
          .specs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* شريط التنقل العلوي */}
      <div className="bg-white shadow-sm py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-purple-600 font-bold text-lg flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            العودة إلى المتجر
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* اسم المنتج - في الأعلى للجوال */}
        <div className="lg:hidden mb-6 bg-white p-6 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {details.brand || product.category}
          </p>

          {/* حالة التوفر */}
          <div className="mb-4">
            <span
              className={`availability-badge ${
                stockStatus === 'In Stock'
                  ? 'available'
                  : stockStatus === 'Limited'
                  ? 'limited'
                  : 'unavailable'
              }`}
            >
              {stockStatus === 'In Stock' ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  متوفر
                </>
              ) : stockStatus === 'Limited' ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  كمية محدودة
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  غير متوفر
                </>
              )}
            </span>
          </div>

          {product.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-lg text-purple-700">⭐</span>
                <span className="font-semibold ml-1 text-purple-700">
                  {product.rating}
                </span>
              </div>
              {details.reviewCount && (
                <span className="text-gray-500 text-sm">
                  ({details.reviewCount} تقييم)
                </span>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-600">
              {formatPrice(product.price)} {product.currency || 'ر.س'}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-lg text-gray-400 line-through">
                {formatPrice(product.originalPrice)} {product.currency || 'ر.س'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 p-6 md:p-8">
            {/* معرض الصور */}
            <div className="order-2 lg:order-1 flex flex-col gap-6">
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                {/* الصورة الرئيسية */}
                <div
                  id="main-image-wrap"
                  className="relative w-full h-80 md:h-96 flex items-center justify-center bg-gray-50 rounded-2xl"
                >
                  <button
                    id="prev-btn"
                    aria-label="السابق"
                    className="absolute left-4 gallery-arrow"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M15 18L9 12L15 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div
                    id="main-image-container"
                    className="w-full h-full flex items-center justify-center overflow-hidden"
                  >
                    <img
                      id="main-image"
                      src={images[0] || ''}
                      alt={product.name}
                      className="object-contain max-h-full max-w-full transition-transform duration-200 ease-in-out cursor-zoom-in"
                    />
                  </div>

                  <button
                    id="next-btn"
                    aria-label="التالي"
                    className="absolute right-4 gallery-arrow"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M9 6L15 12L9 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* علامة الخصم */}
                  {product.discount && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      خصم {product.discount}%
                    </div>
                  )}

                  {/* علامة التميز */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* الصور المصغرة */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3 p-4">
                    {images.map((src, i) => (
                      <div
                        key={`thumbnail-${i}`}
                        className="thumbnail-container h-20 overflow-hidden rounded-xl bg-gray-50 shadow-sm"
                      >
                        <button
                          className={
                            'thumbnail-btn w-full h-full' +
                            (i === 0 ? ' thumb-selected' : '')
                          }
                          data-index={i}
                          title={`عرض الصورة ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`${product.name} ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* معلومات سريعة */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  معلومات سريعة
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الحالة</span>
                    <span
                      className={`font-semibold ${
                        stockStatus === 'In Stock'
                          ? 'text-green-600'
                          : stockStatus === 'Limited'
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}
                    >
                      {stockStatus === 'In Stock'
                        ? 'متوفر'
                        : stockStatus === 'Limited'
                        ? 'كمية محدودة'
                        : 'غير متوفر'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">SKU</span>
                    <span className="font-medium">
                      {details.sku || product.id || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">الفئة</span>
                    <span className="font-medium">
                      {product.category || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">
                      العلامة التجارية
                    </span>
                    <span className="font-medium">
                      {details.brand || '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">التقييم</span>
                    <span className="font-medium">
                      {product.rating ? `${product.rating} ⭐` : '—'}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-gray-600 text-sm">نقاط الأداء</span>
                    <span className="font-medium">
                      {product.performanceScore
                        ? `${product.performanceScore}/100`
                        : '—'}
                    </span>
                  </div>

                  {product.originalPrice && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">
                        السعر الأصلي
                      </span>
                      <span className="font-medium line-through text-red-500">
                        {formatPrice(product.originalPrice)}{' '}
                        {product.currency || 'ر.س'}
                      </span>
                    </div>
                  )}

                  {product.discount && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">نسبة الخصم</span>
                      <span className="font-medium text-green-600">
                        {product.discount}%
                      </span>
                    </div>
                  )}

                  {details.warranty && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">الضمان</span>
                      <span className="font-medium">
                        {details.warranty}
                      </span>
                    </div>
                  )}

                  {details.weight && (
                    <div className="flex flex-col">
                      <span className="text-gray-600 text-sm">الوزن</span>
                      <span className="font-medium">
                        {details.weight}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* معلومات المنتج - للشاشات الكبيرة فقط */}
            <div className="order-1 lg:order-2 hidden lg:flex flex-col gap-6">
              {/* العنوان والسعر */}
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-gray-600 mb-2">
                    {details.brand || product.category}
                  </p>

                  {/* حالة التوفر للشاشات الكبيرة */}
                  <div className="mb-2">
                    <span
                      className={`availability-badge ${
                        stockStatus === 'In Stock'
                          ? 'available'
                          : stockStatus === 'Limited'
                          ? 'limited'
                          : 'unavailable'
                      }`}
                    >
                      {stockStatus === 'In Stock' ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          متوفر
                        </>
                      ) : stockStatus === 'Limited' ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          كمية محدودة
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                          غير متوفر
                        </>
                      )}
                    </span>
                  </div>

                  {product.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-purple-100 px-3 py-1 rounded-full">
                        <span className="text-lg text-purple-700">⭐</span>
                        <span className="font-semibold ml-1 text-purple-700">
                          {product.rating}
                        </span>
                      </div>
                      {details.reviewCount && (
                        <span className="text-gray-500 text-sm">
                          ({details.reviewCount} تقييم)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-600">
                    {formatPrice(product.price)} {product.currency || 'ر.س'}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="text-lg text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}{' '}
                        {product.currency || 'ر.س'}
                      </div>
                    )}
                </div>
              </div>

              {/* المواصفات الأساسية */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <h3 className="font-bold text-lg mb-4 text-gray-800">
                    المواصفات الأساسية
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                      >
                        <div className="text-xs text-gray-500 mb-1">{key}</div>
                        <div className="font-medium text-sm">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أزرار الإجراء للشاشات الكبيرة */}
              <div className="flex gap-4 mt-6">
                <button
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md ${
                    isAvailable
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!isAvailable}
                >
                  {isAvailable ? 'اطلب المنتج الآن' : 'غير متوفر'}
                </button>
                <button className="flex items-center justify-center w-14 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* المواصفات الأساسية وأزرار الإجراء للجوال */}
          <div className="lg:hidden p-6">
            {/* المواصفات الأساسية للجوال */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  المواصفات الأساسية
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-white p-3 rounded-xl shadow-xs border border-gray-100"
                    >
                      <div className="text-xs text-gray-500 mb-1">{key}</div>
                      <div className="font-medium text-sm">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* معلومات الشحن والتوصيل للجوال */}
            <div className="bg-green-50 p-5 rounded-2xl border border-green-200 mb-6">
              <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                الشحن والتوصيل
              </h3>
              <div className="text-green-700">
                <p>• توصيل سريع خلال 2-5 أيام عمل</p>
                <p>• شحن مجاني للطلبات فوق 500 {product.currency || 'ر.س'}</p>
                <p>• إرجاع مجاني خلال 14 يوم</p>
              </div>
            </div>

            {/* أزرار الإجراء للجوال */}
            <div className="sticky-cta bg-white/90 p-4 flex gap-4 mt-4">
              <button
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] shadow-md ${
                  isAvailable
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isAvailable}
              >
                {isAvailable ? 'اطلب المنتج الآن' : 'غير متوفر'}
              </button>
              <button className="flex items-center justify-center w-14 border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* المواصفات التفصيلية */}
          <div className="p-6 md:p-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              المواصفات التفصيلية
            </h2>
            <div className="flex flex-col gap-6">
              {/* الوصف */}
              {details.description && (
                <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-xl mb-4 text-purple-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
                    الوصف
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {details.description}
                  </p>
                </div>
              )}

              {/* مكونات الجهاز */}
              {components &&
                components.length > 0 &&
                renderListCard(
                  'مكونات الجهاز',
                  components,
                  'bg-blue-50',
                  'text-blue-800'
                )}

              {/* معايير الأداء */}
              {benchmarks &&
                Object.keys(benchmarks).length > 0 &&
                renderSpecCard(
                  'معايير الأداء',
                  benchmarks,
                  'bg-red-50',
                  'text-red-800'
                )}

              {/* تفاصيل المنتج */}
              {filteredDetails && Object.keys(filteredDetails).length > 0 &&
                renderSpecCard('تفاصيل المنتج', filteredDetails, 'bg-indigo-50', 'text-indigo-800')
              }

              {/* محتويات الصندوق */}
              {details.inTheBox &&
                renderListCard(
                  'محتويات الصندوق',
                  details.inTheBox.split('،').map(item => item.trim()),
                  'bg-orange-50',
                  'text-orange-800'
                )}

              {/* الأبعاد المادية */}
              {details.dimensions_mm && (
                <div className="bg-violet-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-violet-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-violet-500 rounded-full"></div>
                    الأبعاد المادية
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {details.dimensions_mm.height && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          الارتفاع
                        </div>
                        <div className="font-semibold text-violet-800">
                          {details.dimensions_mm.height} مم
                        </div>
                      </div>
                    )}
                    {details.dimensions_mm.width && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          العرض
                        </div>
                        <div className="font-semibold text-violet-800">
                          {details.dimensions_mm.width} مم
                        </div>
                      </div>
                    )}
                    {details.dimensions_mm.depth && (
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                          العمق
                        </div>
                        <div className="font-semibold text-violet-800">
                          {details.dimensions_mm.depth} مم
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* المنافذ والاتصالات */}
              {details.ports &&
                details.ports.length > 0 &&
                renderListCard(
                  'المنافذ والاتصالات',
                  details.ports,
                  'bg-cyan-50',
                  'text-cyan-800'
                )}

              {/* الملحقات المرفقة */}
              {details.includedAccessories &&
                details.includedAccessories.length > 0 &&
                renderListCard(
                  'الملحقات المرفقة',
                  details.includedAccessories,
                  'bg-orange-50',
                  'text-orange-800'
                )}

              {/* ملاحظات الترقية */}
              {details.upgradeNotes && (
                <div className="bg-yellow-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-yellow-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-yellow-500 rounded-full"></div>
                    ملاحظات الترقية
                  </h4>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                    <p className="font-medium text-yellow-800">
                      {details.upgradeNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* دعم فني */}
              {details.supportUrl && (
                <div className="bg-emerald-50 p-6 rounded-2xl">
                  <h4 className="font-bold text-xl mb-4 text-emerald-700 flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                    الدعم الفني
                  </h4>
                  <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                    <a
                      href={details.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-800 hover:text-emerald-600 underline"
                    >
                      رابط الدعم الفني الرسمي
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* منتجات ذات صلة */}
          {relatedProducts.length > 0 && (
            <div className="p-6 md:p-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                منتجات ذات صلة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 2).map((rp) => (
                  <Link
                    key={`related-${rp.id}`}
                    href={`/accessories/${rp.id}`}
                    className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
                  >
                    <div className="aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={rp.image}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="font-medium mb-1 text-sm line-clamp-2 h-10 overflow-hidden">
                      {rp.name}
                    </div>
                    <div className="text-purple-600 font-bold">
                      {formatPrice(rp.price)} {rp.currency || 'ج.م'}
                    </div>
                    {rp.rating && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        ⭐ {rp.rating}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <div
        id="custom-lightbox"
        style={{ display: 'none' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-0"
      >
        <div
          id="custom-lightbox-bg"
          className="absolute inset-0 bg-black/95"
        ></div>
        <div
          id="custom-lightbox-inner"
          className="relative w-full h-full flex items-center justify-center"
        >
          <button
            id="lb-prev"
            className="absolute left-6 top-1/2 transform -translate-y-1/2 gallery-arrow z-50"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <img
            id="lightbox-image"
            src={images[0] || ''}
            alt={product.name}
            className="max-w-full max-h-full w-auto h-auto object-contain lightbox-img"
          />

          <button
            id="lb-next"
            className="absolute right-6 top-1/2 transform -translate-y-1/2 gallery-arrow z-50"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            id="lb-close"
            className="absolute top-6 right-6 bg-white rounded-full w-10 h-10 flex items-center justify-center text-lg z-50 shadow-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>
      </div>

      {/* سكربت التحكم في المعرض */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function(){
  try {
    const images = ${JSON.stringify(images || [])};
    if (!images || images.length === 0) return;

    function initGallery() {
      try {
        let current = 0;
        const mainImage = document.getElementById('main-image');
        const mainWrap = document.getElementById('main-image-container');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const thumbButtons = Array.from(document.querySelectorAll('.thumbnail-btn'));
        const lightbox = document.getElementById('custom-lightbox');
        const lightboxImage = document.getElementById('lightbox-image');
        const lbClose = document.getElementById('lb-close');
        const lbPrev = document.getElementById('lb-prev');
        const lbNext = document.getElementById('lb-next');

        let panX = 0, panY = 0, scale = 1;

        function resetTransform() {
          panX = 0; panY = 0; scale = 1;
          if (lightboxImage) {
            lightboxImage.style.transition = 'transform 160ms ease';
            lightboxImage.style.transform = 'scale(1) translate(0px,0px)';
          }
        }

        function updateMain(index) {
          current = (index + images.length) % images.length;
          if (mainImage) {
            mainImage.src = images[current] || '';
          }
          thumbButtons.forEach((btn) => btn.classList.remove('thumb-selected'));
          const selectedThumb = thumbButtons.find(b => Number(b.getAttribute('data-index')) === current);
          if (selectedThumb) selectedThumb.classList.add('thumb-selected');
          if (lightboxImage) {
            lightboxImage.src = images[current] || '';
            resetTransform();
          }
        }

        function showLightbox(index) {
          updateMain(index);
          if (lightbox) lightbox.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
          if (lightbox) lightbox.style.display = 'none';
          document.body.style.overflow = '';
          resetTransform();
        }

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });
        }

        thumbButtons.forEach((btn) => {
          const idx = Number(btn.getAttribute('data-index'));
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            showLightbox(idx);
          });
        });

        if (mainImage) {
          mainImage.addEventListener('click', () => showLightbox(current));
        }

        if (lbClose) lbClose.addEventListener('click', closeLightbox);
        if (lightbox) lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.id === 'custom-lightbox-bg') closeLightbox();
        });
        if (lbPrev) lbPrev.addEventListener('click', (e) => { e.preventDefault(); updateMain(current - 1); });
        if (lbNext) lbNext.addEventListener('click', (e) => { e.preventDefault(); updateMain(current + 1); });

        document.addEventListener('keydown', (e) => {
          if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') updateMain(current - 1);
            if (e.key === 'ArrowRight') updateMain(current + 1);
          }
        });

        if (mainWrap && mainImage) {
          let isHover = false;
          mainWrap.addEventListener('mouseenter', () => {
            isHover = true;
            mainImage.style.transition = 'transform 120ms ease';
            mainImage.style.transform = 'scale(1.06)';
          });
          mainWrap.addEventListener('mousemove', (ev) => {
            if (!isHover) return;
            const rect = mainImage.getBoundingClientRect();
            const x = ((ev.clientX - rect.left) / rect.width) * 100;
            const y = ((ev.clientY - rect.top) / rect.height) * 100;
            mainImage.style.transformOrigin = x + '% ' + y + '%';
            mainImage.style.transform = 'scale(1.06)';
          });
          mainWrap.addEventListener('mouseleave', () => {
            isHover = false;
            mainImage.style.transform = 'scale(1)';
            mainImage.style.transformOrigin = 'center center';
          });
        }

        updateMain(0);
      } catch (errInit) {
        console.error('Gallery init error', errInit);
      }
    }

    if (document.readyState === 'complete') {
      setTimeout(initGallery, 50);
    } else {
      window.addEventListener('load', function onLoad() {
        window.removeEventListener('load', onLoad);
        setTimeout(initGallery, 50);
      });
    }

  } catch (err) {
    console.error('Gallery script error', err);
  }
})();
          `,
        }}
      />
    </main>
  );
}