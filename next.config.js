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
    // Pre-compilar rutas en build time para mejor performance
    optimizeCss: true,
    // Optimizar imágenes
    optimizeServerReact: true,
  },
  // Compresión y optimización de producción
  compress: true,
  // Optimización de bundle
  swcMinify: true,
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
