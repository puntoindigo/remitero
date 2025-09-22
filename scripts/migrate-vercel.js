const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateVercelDatabase() {
  try {
    console.log('🚀 Iniciando migración de base de datos en Vercel...');
    
    // Verificar si el campo stock existe
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product' AND column_name = 'stock';
    `;
    
    if (result.length === 0) {
      console.log('📝 Campo stock no existe, creándolo...');
      
      // Crear el enum StockStatus si no existe
      await prisma.$executeRaw`
        DO $$ BEGIN
          CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `;
      
      // Agregar la columna stock
      await prisma.$executeRaw`
        ALTER TABLE "Product" 
        ADD COLUMN IF NOT EXISTS "stock" "StockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK';
      `;
      
      console.log('✅ Campo stock creado exitosamente');
    } else {
      console.log('✅ Campo stock ya existe');
    }
    
    // Verificar la estructura final
    const finalResult = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura final de la tabla Product:');
    console.table(finalResult);
    
    console.log('\n🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateVercelDatabase();
