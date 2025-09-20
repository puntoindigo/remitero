const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProductsStock() {
  try {
    console.log('Actualizando stock de productos existentes...');
    
    // Obtener todos los productos
    const allProducts = await prisma.product.findMany();
    
    console.log(`Encontrados ${allProducts.length} productos`);
    
    // Actualizar cada producto individualmente
    for (const product of allProducts) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: 'IN_STOCK' }
      });
    }
    
    console.log(`Total de productos actualizados: ${allProducts.length}`);
    
  } catch (error) {
    console.error('Error actualizando productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductsStock();
