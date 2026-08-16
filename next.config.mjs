/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.pravatar.cc' },
      { protocol: 'https', hostname: '**.cdn*' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {},

  // 🔹 تعطيل الكاش بتاع turbopack عشان مشكلة lockfile على ويندوز (bug معروف حاليًا)
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;