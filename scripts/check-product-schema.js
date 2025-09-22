const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductSchema() {
  try {
    console.log('=== CHECKING PRODUCT SCHEMA ===');
    
    // Get one product to see its structure
    const product = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
        description: true
      }
    });
    
    console.log('Sample product:', product);
    
    // Try to update stock
    if (product) {
      console.log('=== TESTING STOCK UPDATE ===');
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: { stock: 'IN_STOCK' }
      });
      console.log('Stock update successful:', updated);
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductSchema();
