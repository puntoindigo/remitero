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
}

module.exports = nextConfig
