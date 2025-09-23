#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function seedData() {
  try {
    console.log('🌱 Creando datos de prueba en desarrollo...');
    
    // Crear company
    const company = await devPrisma.company.upsert({
      where: { name: "Distribuidora Ruben - DEV" },
      update: {},
      create: {
        name: "Distribuidora Ruben - DEV"
      }
    });
    console.log('✅ Company:', company.name);
    
    // Crear user
    const user = await devPrisma.user.upsert({
      where: { email: "ruben@distribuidora-dev.com" },
      update: {},
      create: {
        name: "Ruben Dev",
        email: "ruben@distribuidora-dev.com",
        password: "$2a$10$example",
        role: "ADMIN",
        companyId: company.id
      }
    });
    console.log('✅ User:', user.name);
    
    // Crear category
    const category = await devPrisma.category.upsert({
      where: { 
        companyId_name: {
          companyId: company.id,
          name: "Productos de Prueba"
        }
      },
      update: {},
      create: {
        name: "Productos de Prueba",
        companyId: company.id
      }
    });
    console.log('✅ Category:', category.name);
    
    // Crear products
    const product1 = await devPrisma.product.upsert({
      where: { 
        companyId_name: {
          companyId: company.id,
          name: "Producto Dev 1"
        }
      },
      update: {},
      create: {
        name: "Producto Dev 1",
        description: "Descripción del producto de prueba 1",
        price: 100.50,
        stock: "IN_STOCK",
        categoryId: category.id,
        companyId: company.id
      }
    });
    
    const product2 = await devPrisma.product.upsert({
      where: { 
        companyId_name: {
          companyId: company.id,
          name: "Producto Dev 2"
        }
      },
      update: {},
      create: {
        name: "Producto Dev 2",
        description: "Descripción del producto de prueba 2",
        price: 250.75,
        stock: "OUT_OF_STOCK",
        categoryId: category.id,
        companyId: company.id
      }
    });
    console.log('✅ Products creados');
    
    // Crear client
    const client = await devPrisma.client.upsert({
      where: { 
        companyId_name: {
          companyId: company.id,
          name: "Cliente Dev"
        }
      },
      update: {},
      create: {
        name: "Cliente Dev",
        address: "Calle Cliente 456",
        phone: "+54 11 9876-5432",
        email: "cliente@dev.com",
        companyId: company.id
      }
    });
    console.log('✅ Client:', client.name);
    
    // Crear remito
    const remito = await devPrisma.remito.upsert({
      where: { 
        companyId_number: {
          companyId: company.id,
          number: 1
        }
      },
      update: {},
      create: {
        number: 1,
        clientId: client.id,
        companyId: company.id,
        status: "PENDIENTE",
        notes: "Remito de prueba para desarrollo",
        total: 351.25
      }
    });
    console.log('✅ Remito:', remito.number);
    
    // Crear remito items
    await devPrisma.remitoItem.upsert({
      where: { 
        remitoId_productId: {
          remitoId: remito.id,
          productId: product1.id
        }
      },
      update: {},
      create: {
        remitoId: remito.id,
        productId: product1.id,
        quantity: 2,
        unitPrice: product1.price,
        lineTotal: product1.price * 2
      }
    });
    
    await devPrisma.remitoItem.upsert({
      where: { 
        remitoId_productId: {
          remitoId: remito.id,
          productId: product2.id
        }
      },
      update: {},
      create: {
        remitoId: remito.id,
        productId: product2.id,
        quantity: 1,
        unitPrice: product2.price,
        lineTotal: product2.price * 1
      }
    });
    console.log('✅ Remito items creados');
    
    console.log('🎉 ¡Datos de prueba creados exitosamente!');
    console.log('🔗 Ahora puedes verificar que los datos aparecen en Preview pero NO en Producción');
    
  } catch (error) {
    console.error('❌ Error creando datos:', error);
    throw error;
  } finally {
    await devPrisma.$disconnect();
  }
}

seedData()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
