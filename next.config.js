/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['douvy.com'],
  },
  // To enable Vercel Analytics once deployed
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  }
};

module.exports = nextConfig;