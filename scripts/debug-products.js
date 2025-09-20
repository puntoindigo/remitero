const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProducts() {
  try {
    console.log('Verificando datos de productos en la base de datos...');
    
    const products = await prisma.product.findMany({
      include: { category: true },
      take: 3
    });
    
    console.log('Primeros 3 productos:');
    products.forEach((product, index) => {
      console.log(`\nProducto ${index + 1}:`);
      console.log('ID:', product.id);
      console.log('Name:', product.name);
      console.log('Description:', product.description);
      console.log('Price:', product.price);
      console.log('Stock:', product.stock);
      console.log('Category:', product.category?.name || 'Sin categoría');
      console.log('CreatedAt:', product.createdAt);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProducts();
