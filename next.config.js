/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurar el directorio raíz para evitar conflictos con lockfiles
  outputFileTracingRoot: __dirname,
  // Optimizaciones de caché y compilación
  experimental: {
    // Optimizar compilación de rutas
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    // optimizeCss requiere critters, deshabilitado temporalmente para evitar errores de build
    // optimizeCss: true,
    // Optimizar imágenes
    optimizeServerReact: true,
  },
  // Compresión y optimización de producción
  compress: true,
  // swcMinify está habilitado por defecto en Next.js 15, no es necesario especificarlo
  // Configuración para mejorar HMR y evitar conexiones colgadas
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Mejorar configuración de HMR para evitar conexiones pendientes
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
      };
    }
    return config;
  },
  // Headers de caché para assets estáticos (solo para archivos estáticos)
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
