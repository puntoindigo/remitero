const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDBSchema() {
  try {
    console.log('=== CHECKING DATABASE SCHEMA ===');
    
    // Verificar si el campo stock existe
    const sampleProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true
      }
    });
    
    console.log('Sample product (without stock):', sampleProduct);
    
    // Intentar acceder al campo stock
    try {
      const productWithStock = await prisma.product.findFirst({
        select: {
          id: true,
          name: true,
          stock: true
        }
      });
      console.log('Product with stock field:', productWithStock);
    } catch (error) {
      console.log('❌ Stock field does not exist in database');
      console.log('Error:', error.message);
      
      // El campo stock no existe, necesitamos agregarlo
      console.log('=== ADDING STOCK FIELD ===');
      
      // Esto requeriría una migración de Prisma
      console.log('Necesitamos ejecutar: npx prisma db push');
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDBSchema();
