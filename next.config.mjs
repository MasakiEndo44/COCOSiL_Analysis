/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors during build should fail the build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint errors during build should fail the build
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Enable Server Actions
    serverActions: true,
  },
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // Environment variables available in browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'COCOSiL',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

export default nextConfig