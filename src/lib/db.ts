import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configurar DATABASE_URL según el entorno
const getDatabaseUrl = () => {
  // Si estamos en preview/development, usar dev_DATABASE_URL
  if (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') {
    return process.env.dev_DATABASE_URL || process.env.DATABASE_URL
  }
  // Para producción, usar DATABASE_URL
  return process.env.DATABASE_URL
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
