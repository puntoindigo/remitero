const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductDescriptions() {
  try {
    console.log('Verificando productos con descripciones incorrectas...');
    
    // Encontrar productos que tienen "Producto:" en la descripción
    const productsWithBadDescription = await prisma.product.findMany({
      where: {
        description: {
          contains: 'Producto:'
        }
      }
    });
    
    console.log(`Encontrados ${productsWithBadDescription.length} productos con descripciones incorrectas:`);
    
    for (const product of productsWithBadDescription) {
      console.log(`- ${product.name}: "${product.description}"`);
    }
    
    if (productsWithBadDescription.length > 0) {
      console.log('\nLimpiando descripciones incorrectas...');
      
      // Actualizar todos los productos que tienen "Producto:" en la descripción
      for (const product of productsWithBadDescription) {
        await prisma.product.update({
          where: { id: product.id },
          data: { description: null } // Establecer como null para que no se muestre
        });
        console.log(`✓ Limpiada descripción de: ${product.name}`);
      }
      
      console.log(`\n✅ Se limpiaron ${productsWithBadDescription.length} descripciones incorrectas`);
    } else {
      console.log('\n✅ No se encontraron descripciones incorrectas');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductDescriptions();
