import { Rubik, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/navbar';
import Footer from './components/footer';

// Edge runtime
export const runtime = 'edge';
export const experimental = {
  appDir: true,
  serverComponentsExternalPackages: [],
};
export const nextFontManifest = {};

// Google fonts مع تحسين الأداء
const rubik = Rubik({
  variable: '--font-rubik-sans',
  subsets: ['latin'],
  display: 'swap',
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

// ----- METADATA (بدّل القيم هذه بالقيم الحقيقية لموقعك) -----
export const metadata = {
  title: {
    default: 'TechLap Elite | احدث الادوات التقنية',
    template: '%s | TechLap Elite',
  },
  description:
    'اكتشف أحدث المنتجات التقنية، أجهزة الكمبيوتر، والإكسسوارات — مواصفات مفصلة، عروض يومية، وشحن سريع.',
  icons: {
    icon: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=64&v=3',
    shortcut:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=64&v=3',
    apple:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=180&v=3',
  },
  keywords: [
    'تقنية',
    'لابتوبات',
    'إلكترونيات',
    'أجهزة كمبيوتر',
    'إكسسوارات',
    'تسوق',
    'عروض',
    'أجهزة للمبدعين',
    'TechLap Elite',
    'لابتوبات الأعمال',
    'أحدث أجهزة الجيمينج',
    'لابتوبات للمونتاج',
    'شحن سريع مصر',
    'ضمان محلي',
  ],
  // ✅ الصيغة الصحيحة لـ authors داخل metadata: مصفوفة بسيطة
  authors: [
    {
      name: 'Hany Younan Nazer',
      url: 'https://my-portfolio-tau-six-33.vercel.app/', // لو تحب تحط البورتفوليو هنا
    },
  ],
  creator: 'Hany Younan Nazer',
  publisher: 'TechLap Elite',
  // مهم: metadataBase يجب أن يكون الدومين الرئيسي (يُستعمل لبناء روابط نسبية في الـmetadata)
  metadataBase: new URL('https://lap-tech-five.vercel.app/'),
  openGraph: {
    title: {
      default: 'TechLap Elite | احدث الادوات التقنية',
      template: '%s | TechLap Elite',
    },
    description:
      'تسوّق أحدث الادوات التقنية وأفضل الإكسسوارات مع أسعار تنافسية وجودة عالية.',
    url: 'https://lap-tech-five.vercel.app/',
    siteName: 'TechLap Elite',
    images: [
      {
        // استخدم مسار مطلق لـ OG image
        url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'TechLap Elite - أحدث المنتجات',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
};

// ====== export viewport ======
export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// ====== JSON-LD structured data (مفصّل) ======
const structuredData = {
  '@context': 'https://schema.org', // خليها زي ما هي — مطلوبه علشان Google يفهم الـ JSON-LD
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://lap-tech-five.vercel.app/#person-hany',
      // ✳️ تأكد إن هذا ال-URL هو الدومين النهائي للموقع (لو هتغير الدومين غيّره هنا كمان)
      name: 'Hany Younan Nazer', // OK
      url: 'https://my-portfolio-tau-six-33.vercel.app/',
      // 🔧 يفضل لو تحط هنا صفحة الـ About أو البروفايل الرسمية على نفس الدومين لو متوفرة
      sameAs: [
        // صحّحت الروابط لتشمل البروتوكول
        'https://www.linkedin.com/in/hany-younan-5b7466372',
        'https://github.com/hanynan8',
        'https://www.facebook.com/hany.nan.752/',
      ],
      jobTitle: 'Full Stack Web Developer (Next/Node)',
      // 🔧 يفضل توسيعها: مثلاً "Full Stack Web Developer" أو "Full Stack Developer (React/Node)"
    },
    {
      '@type': 'Organization',
      '@id': 'https://lap-tech-five.vercel.app/#organization',
      name: 'TechLap Elite', // OK
      url: 'https://lap-tech-five.vercel.app/',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+20-120-106-1216', // استبدل بالرقم الرسمي لو عندك
          contactType: 'customer service',
          areaServed: 'EG',
          availableLanguage: ['ar', 'en'],
        },
      ],
      // 🔧 (اختياري لكن موصى به) أضف contactPoint لو حابب تعرض تليفون دعم/خدمة عملاء — يساعد المستخدم ومحركات البحث.
    },
    {
      '@type': 'WebSite',
      '@id': 'https://lap-tech-five.vercel.app/#website',
      url: 'https://lap-tech-five.vercel.app/',
      name: 'TechLap Elite',
      publisher: { '@id': 'https://lap-tech-five.vercel.app/#organization' }, // OK — اربطه بالـ Organization أعلاه
      potentialAction: {
        '@type': 'SearchAction',
        target:
          'https://lap-tech-five.vercel.app/search?q={search_term_string}',
        // 🔧 تأكد إن هذا الـ endpoint شغال فعلاً ويستقبل باراميتر q
        // 🔧 بعض المواقع تستخدم '/search?query=' أو '/search/{term}' — عدّل الصيغة لتطابق مسار البحث الفعلي
      },
      // additionalProperty: [...],
      // 🔧 لو عندك خصائص إضافية للموقع ممكن تضيفها هنا لكن مش ضرورية
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${rubik.className} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Navbar />
        <main>{children}</main>

        {/* JSON-LD: غيّر القيم في structuredData أعلاه لو حبيت */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <Footer />
      </body>
    </html>
  );
}
