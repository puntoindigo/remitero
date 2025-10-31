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
  // Deshabilitar turbopack para evitar problemas con HMR (si lo estás usando)
  // experimental: {
  //   turbo: false,
  // },
}

module.exports = nextConfig
