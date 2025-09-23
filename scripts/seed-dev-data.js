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
    const company = await devPrisma.company.create({
      data: {
        name: "Distribuidora Ruben - DEV"
      }
    });
    console.log('✅ Company creada:', company.name);
    
    // Crear user
    const user = await devPrisma.user.create({
      data: {
        name: "Ruben Dev",
        email: "ruben@distribuidora-dev.com",
        password: "$2a$10$example", // Password hasheado
        role: "ADMIN",
        companyId: company.id
      }
    });
    console.log('✅ User creado:', user.name);
    
    // Crear category
    const category = await devPrisma.category.create({
      data: {
        name: "Productos de Prueba",
        description: "Categoría para testing",
        companyId: company.id
      }
    });
    console.log('✅ Category creada:', category.name);
    
    // Crear products
    const products = await Promise.all([
      devPrisma.product.create({
        data: {
          name: "Producto Dev 1",
          description: "Descripción del producto de prueba 1",
          price: 100.50,
          stock: "IN_STOCK",
          categoryId: category.id,
          companyId: company.id
        }
      }),
      devPrisma.product.create({
        data: {
          name: "Producto Dev 2",
          description: "Descripción del producto de prueba 2",
          price: 250.75,
          stock: "OUT_OF_STOCK",
          categoryId: category.id,
          companyId: company.id
        }
      })
    ]);
    console.log(`✅ ${products.length} products creados`);
    
    // Crear client
    const client = await devPrisma.client.create({
      data: {
        name: "Cliente Dev",
        address: "Calle Cliente 456",
        phone: "+54 11 9876-5432",
        email: "cliente@dev.com",
        companyId: company.id
      }
    });
    console.log('✅ Client creado:', client.name);
    
    // Crear remito
    const remito = await devPrisma.remito.create({
      data: {
        number: 1,
        clientId: client.id,
        companyId: company.id,
        status: "PENDIENTE",
        notes: "Remito de prueba para desarrollo",
        total: 351.25
      }
    });
    console.log('✅ Remito creado:', remito.number);
    
    // Crear remito items
    const items = await Promise.all([
      devPrisma.remitoItem.create({
        data: {
          remitoId: remito.id,
          productId: products[0].id,
          quantity: 2,
          unitPrice: products[0].price,
          lineTotal: products[0].price * 2
        }
      }),
      devPrisma.remitoItem.create({
        data: {
          remitoId: remito.id,
          productId: products[1].id,
          quantity: 1,
          unitPrice: products[1].price,
          lineTotal: products[1].price * 1
        }
      })
    ]);
    console.log(`✅ ${items.length} remito items creados`);
    
    console.log('🎉 ¡Datos de prueba creados exitosamente!');
    
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
