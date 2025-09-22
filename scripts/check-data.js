const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== CHECKING DATA ===');
    
    // Check remitos
    const remitos = await prisma.remito.findMany({
      take: 5,
      include: {
        client: true,
        createdBy: true
      }
    });
    console.log('Remitos count:', remitos.length);
    console.log('Sample remito:', remitos[0]);
    
    // Check clients
    const clients = await prisma.client.findMany({
      take: 5
    });
    console.log('Clients count:', clients.length);
    console.log('Sample client:', clients[0]);
    
    // Check products
    const products = await prisma.product.findMany({
      take: 5,
      where: { stock: 'IN_STOCK' }
    });
    console.log('Products with stock count:', products.length);
    console.log('Sample product:', products[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
