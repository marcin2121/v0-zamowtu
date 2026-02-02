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
        {
          // Dodaj polskie znaki (ą,ę,ć...) jeśli slugi mogą je mieć
          // Dodaj underscore _ jeśli używasz (np. moja_restauracja)
          source: '/:slug((?!api|auth|dashboard|demo|login|admin|help|_next|static|public|favicon\\.ico|\\.)[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ_-]+)',
          destination: '/r/:slug',
        },
      ],
    }
  },
}

export default nextConfig
