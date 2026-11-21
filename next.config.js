/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // A stray lockfile in the parent directory makes Next infer the wrong
  // workspace root; pin it to this repo.
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
