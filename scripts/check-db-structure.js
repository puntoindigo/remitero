const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Verificando estructura de la base de datos...');
    
    // Verificar si existe la tabla Product
    const productCount = await prisma.product.count();
    console.log(`📊 Total de productos: ${productCount}`);
    
    // Obtener un producto de ejemplo para ver su estructura
    const sampleProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log('\n📋 Estructura del producto de ejemplo:');
    console.log(JSON.stringify(sampleProduct, null, 2));
    
    // Intentar acceder al campo stock
    try {
      const productWithStock = await prisma.product.findFirst({
        select: {
          id: true,
          name: true,
          stock: true
        }
      });
      console.log('\n✅ Campo stock disponible:');
      console.log(JSON.stringify(productWithStock, null, 2));
    } catch (stockError) {
      console.log('\n❌ Campo stock NO disponible:');
      console.log('Error:', stockError.message);
    }
    
    // Verificar el esquema de la base de datos
    console.log('\n🔧 Verificando esquema de la base de datos...');
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Product' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Columnas de la tabla Product:');
    console.table(result);
    
  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStructure();
