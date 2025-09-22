const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanStockDescriptions() {
  try {
    console.log('🧹 Limpiando descripciones que contienen información de stock...');
    
    // Buscar productos que tengan "Stock: " en la descripción
    const productsWithStockInDescription = await prisma.product.findMany({
      where: {
        description: {
          contains: 'Stock: '
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        stock: true
      }
    });
    
    console.log(`📊 Encontrados ${productsWithStockInDescription.length} productos con stock en descripción`);
    
    for (const product of productsWithStockInDescription) {
      console.log(`\n🔍 Procesando: ${product.name}`);
      console.log(`   Descripción actual: "${product.description}"`);
      console.log(`   Stock actual: ${product.stock}`);
      
      // Extraer el stock de la descripción
      const stockMatch = product.description.match(/Stock: (IN_STOCK|OUT_OF_STOCK)/);
      const stockFromDescription = stockMatch ? stockMatch[1] : null;
      
      if (stockFromDescription) {
        console.log(`   Stock encontrado en descripción: ${stockFromDescription}`);
        
        // Limpiar la descripción removiendo "Stock: XXX"
        const cleanDescription = product.description.replace(/Stock: (IN_STOCK|OUT_OF_STOCK)/, '').trim();
        
        // Actualizar el producto con la descripción limpia y el stock correcto
        await prisma.product.update({
          where: { id: product.id },
          data: {
            description: cleanDescription || null,
            stock: stockFromDescription
          }
        });
        
        console.log(`   ✅ Actualizado - Descripción: "${cleanDescription || 'null'}", Stock: ${stockFromDescription}`);
      } else {
        console.log(`   ⚠️  No se pudo extraer stock de la descripción`);
      }
    }
    
    console.log('\n🎉 Limpieza completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanStockDescriptions();
