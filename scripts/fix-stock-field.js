const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStockField() {
  try {
    console.log('=== FIXING STOCK FIELD ===');
    
    // Check if stock field exists
    const sampleProduct = await prisma.product.findFirst({
      select: {
        id: true,
        name: true,
        stock: true
      }
    });
    
    console.log('Sample product before fix:', sampleProduct);
    
    if (sampleProduct && sampleProduct.stock === null) {
      console.log('Stock field is null, updating to IN_STOCK...');
      
      // Update all products to have IN_STOCK by default
      const updateResult = await prisma.product.updateMany({
        where: {
          stock: null
        },
        data: {
          stock: 'IN_STOCK'
        }
      });
      
      console.log('Updated products:', updateResult.count);
    }
    
    // Test updating a product
    if (sampleProduct) {
      console.log('Testing stock update...');
      const updated = await prisma.product.update({
        where: { id: sampleProduct.id },
        data: { stock: 'OUT_OF_STOCK' }
      });
      console.log('Test update successful:', updated);
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixStockField();
