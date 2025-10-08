/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {}, // ✅ Must be an object now (empty is fine)
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // optional: prevents ESLint errors from blocking production builds
  },
};

module.exports = nextConfig;

