import createMDX from '@next/mdx'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  typescript: {
    // TypeScript errors during build should fail the build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint errors during build should fail the build
    ignoreDuringBuilds: false,
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

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight, rehypeSlug],
  },
})

// Wrap MDX and Next.js config with each other
export default withMDX(nextConfig)