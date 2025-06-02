/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  images: {
    domains: ['douvy.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Use standalone output for better caching
  output: 'standalone',
  // Enable compression
  compress: true,
};

module.exports = nextConfig;