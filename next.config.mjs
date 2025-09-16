/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 إعداد الصور
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.pravatar.cc' },
      { protocol: 'https', hostname: '**.cdn*' }, // أي CDN عام
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },

  // 🔹 تعطيل eslint في dev mode (يساعد على السرعة)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 🔹 تعطيل type checking في build (خليها في CI بس)
  typescript: {
    ignoreBuildErrors: true,
  },

  // 🔹 تفعيل turbo (لو مدعوم في نسختك)
  experimental: {
    turbo: true,
  },
};

export default nextConfig;
