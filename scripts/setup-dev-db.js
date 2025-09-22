const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDevelopmentDatabase() {
  try {
    console.log('🚀 Configurando base de datos de desarrollo...');
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');
    
    // Crear enum StockStatus si no existe
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✅ Enum StockStatus creado/verificado');
    
    // Agregar columna stock si no existe
    await prisma.$executeRaw`
      ALTER TABLE "Product" 
      ADD COLUMN IF NOT EXISTS "stock" "StockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK';
    `;
    console.log('✅ Columna stock agregada/verificada');
    
    // Verificar estructura
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Estructura de la tabla Product:');
    console.table(result);
    
    // Crear algunos datos de prueba si no existen
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      console.log('\n📝 Creando datos de prueba...');
      
      // Crear empresa de prueba
      const company = await prisma.company.create({
        data: {
          name: 'Empresa de Desarrollo'
        }
      });
      
      // Crear usuario de prueba
      const user = await prisma.user.create({
        data: {
          email: 'admin@dev.com',
          password: '$2a$10$hashedpassword', // Cambiar por hash real
          name: 'Admin Desarrollo',
          role: 'ADMIN',
          companyId: company.id
        }
      });
      
      // Crear categoría de prueba
      const category = await prisma.category.create({
        data: {
          name: 'Bebidas',
          companyId: company.id
        }
      });
      
      // Crear productos de prueba
      await prisma.product.createMany({
        data: [
          {
            name: 'Agua x6',
            price: 1200,
            stock: 'IN_STOCK',
            companyId: company.id,
            categoryId: category.id
          },
          {
            name: 'Coca Cola 2L',
            price: 1800,
            stock: 'OUT_OF_STOCK',
            companyId: company.id,
            categoryId: category.id
          }
        ]
      });
      
      console.log('✅ Datos de prueba creados');
    } else {
      console.log(`✅ Base de datos ya tiene ${productCount} productos`);
    }
    
    console.log('\n🎉 Base de datos de desarrollo configurada exitosamente');
    
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDevelopmentDatabase();
