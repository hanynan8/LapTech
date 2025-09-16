import { Rubik, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from './components/navbar/navbar';
import Footer from './components/footer/footer';
import LayoutClient from './layoutClient';

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
  authors: [
    {
      name: 'Hany Younan Nazer',
      url: 'https://my-portfolio-tau-six-33.vercel.app/',
    },
  ],
  creator: 'Hany Younan Nazer',
  publisher: 'TechLap Elite',
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
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://lap-tech-five.vercel.app/#person-hany',
      name: 'Hany Younan Nazer',
      url: 'https://my-portfolio-tau-six-33.vercel.app/',
      sameAs: [
        'https://www.linkedin.com/in/hany-younan-5b7466372',
        'https://github.com/hanynan8',
        'https://www.facebook.com/hany.nan.752/',
      ],
      jobTitle: 'Full Stack Web Developer (Next/Node)',
    },
    {
      '@type': 'Organization',
      '@id': 'https://lap-tech-five.vercel.app/#organization',
      name: 'TechLap Elite',
      url: 'https://lap-tech-five.vercel.app/',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+20-120-106-1216',
          contactType: 'customer service',
          areaServed: 'EG',
          availableLanguage: ['ar', 'en'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://lap-tech-five.vercel.app/#website',
      url: 'https://lap-tech-five.vercel.app/',
      name: 'TechLap Elite',
      publisher: { '@id': 'https://lap-tech-five.vercel.app/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target:
          'https://lap-tech-five.vercel.app/search?q={search_term_string}',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${rubik.className} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <LayoutClient>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LayoutClient>

        {/* JSON-LD: غيّر القيم في structuredData أعلاه لو حبيت */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}