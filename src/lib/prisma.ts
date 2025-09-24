import { PrismaClient } from "@prisma/client";

/**
 * Crea una instancia de PrismaClient configurada para el entorno actual
 * Maneja automáticamente las variables de entorno de desarrollo y producción
 */
export const createPrismaClient = (): PrismaClient => {
  const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development';
  
  const databaseUrl = isPreview 
    ? process.env.DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL || process.env.dev_POSTGRES_URL
    : process.env.DATABASE_URL || process.env.prod_PRISMA_DATABASE_URL || process.env.prod_POSTGRES_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
  });
};

/**
 * Wrapper para ejecutar operaciones de Prisma con manejo automático de conexiones
 */
export const withPrisma = async <T>(
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> => {
  const prisma = createPrismaClient();
  
  try {
    return await operation(prisma);
  } finally {
    await prisma.$disconnect();
  }
};
