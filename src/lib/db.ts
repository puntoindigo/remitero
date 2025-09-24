import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar DATABASE_URL según el entorno
const getDatabaseUrl = () => {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development'
  
  if (isPreview) {
    // Para desarrollo/preview, usar DATABASE_URL que ya está configurada correctamente
    const devUrl = process.env.DATABASE_URL
    console.log('🔧 DESARROLLO/PREVIEW - Usando DATABASE_URL:', devUrl ? '✅ Configurada' : '❌ No encontrada')
    return devUrl
  }
  
  // Para producción, usar DATABASE_URL que ya está configurada correctamente
  const prodUrl = process.env.DATABASE_URL
  console.log('🚀 PRODUCCIÓN - Usando DATABASE_URL:', prodUrl ? '✅ Configurada' : '❌ No encontrada')
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
