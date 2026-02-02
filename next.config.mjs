/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Dynamiczne restauracje - mapuj /slug na /r/slug
        // Ale unikaj ścieżek systemowych
        {
          source: '/:slug((?!api|auth|dashboard|demo|_next|static|public|\\.)[a-zA-Z0-9-]+)',
          destination: '/r/:slug',
        },
      ],
    }
  },
}

export default nextConfig
