import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar DATABASE_URL según el entorno
const getDatabaseUrl = () => {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'
  
  if (isPreview) {
    const devUrl = process.env.dev_DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL
    console.log('🔧 DESARROLLO/PREVIEW - Usando dev_DATABASE_URL:', devUrl ? '✅ Configurada' : '❌ No encontrada')
    return devUrl
  }
  
  const prodUrl = process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL
  console.log('🚀 PRODUCCIÓN - Usando PRISMA_DATABASE_URL:', prodUrl ? '✅ Configurada' : '❌ No encontrada')
  return prodUrl
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
