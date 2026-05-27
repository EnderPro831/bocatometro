import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      // Por si alguien llega a /añadir lo mandamos a /anadir
      {
        source: '/a%C3%B1adir',
        destination: '/anadir',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
