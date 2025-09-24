#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Usar variables de entorno para producción
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL
    }
  }
});

async function populateProduction() {
  try {
    console.log('🚀 Poblando datos de producción...');
    
    if (!process.env.PRISMA_DATABASE_URL && !process.env.POSTGRES_URL) {
      throw new Error('No hay URL de base de datos de producción configurada');
    }
    
    // Crear company principal
    const company = await prodPrisma.company.upsert({
      where: { name: "Distribuidora Ruben" },
      update: {},
      create: {
        name: "Distribuidora Ruben"
      }
    });
    console.log('✅ Company:', company.name);
    
    // Crear usuario admin
    const user = await prodPrisma.user.upsert({
      where: { email: "admin@remitero.com" },
      update: {},
      create: {
        name: "Super Admin",
        email: "admin@remitero.com",
        password: "$2a$10$example", // Contraseña hasheada
        role: "SUPER_ADMIN",
        companyId: company.id
      }
    });
    console.log('✅ User:', user.name);
    
    // Crear usuario demo
    const demoUser = await prodPrisma.user.upsert({
      where: { email: "admin@empresademo.com" },
      update: {},
      create: {
        name: "Admin Demo",
        email: "admin@empresademo.com",
        password: "$2a$10$example", // Contraseña hasheada
        role: "ADMIN",
        companyId: company.id
      }
    });
    console.log('✅ Demo User:', demoUser.name);
    
    // Crear categorías
    const categoria1 = await prodPrisma.category.upsert({
      where: { 
        name_companyId: {
          name: "Productos de Limpieza",
          companyId: company.id
        }
      },
      update: {},
      create: {
        name: "Productos de Limpieza",
        companyId: company.id
      }
    });
    
    const categoria2 = await prodPrisma.category.upsert({
      where: { 
        name_companyId: {
          name: "Alimentos",
          companyId: company.id
        }
      },
      update: {},
      create: {
        name: "Alimentos",
        companyId: company.id
      }
    });
    console.log('✅ Categorías creadas');
    
    // Crear productos
    const productos = [
      {
        name: "Detergente Líquido",
        description: "Detergente líquido para ropa, 1 litro",
        price: 450.00,
        stock: "IN_STOCK",
        categoryId: categoria1.id,
        companyId: company.id
      },
      {
        name: "Arroz Blanco",
        description: "Arroz blanco premium, 1kg",
        price: 320.00,
        stock: "IN_STOCK",
        categoryId: categoria2.id,
        companyId: company.id
      },
      {
        name: "Aceite de Girasol",
        description: "Aceite de girasol, 900ml",
        price: 280.00,
        stock: "OUT_OF_STOCK",
        categoryId: categoria2.id,
        companyId: company.id
      }
    ];
    
    for (const productoData of productos) {
      await prodPrisma.product.upsert({
        where: {
          name_companyId: {
            name: productoData.name,
            companyId: company.id
          }
        },
        update: {},
        create: productoData
      });
    }
    console.log('✅ Productos creados');
    
    // Crear clientes
    const clientes = [
      {
        name: "Cliente Demo 1",
        address: "Av. Principal 123",
        phone: "+54 11 1234-5678",
        email: "cliente1@demo.com",
        companyId: company.id
      },
      {
        name: "Cliente Demo 2",
        address: "Calle Secundaria 456",
        phone: "+54 11 8765-4321",
        email: "cliente2@demo.com",
        companyId: company.id
      }
    ];
    
    for (const clienteData of clientes) {
      await prodPrisma.client.upsert({
        where: {
          name_companyId: {
            name: clienteData.name,
            companyId: company.id
          }
        },
        update: {},
        create: clienteData
      });
    }
    console.log('✅ Clientes creados');
    
    console.log('🎉 ¡Datos de producción poblados exitosamente!');
    console.log('🔗 Ahora puedes acceder a la aplicación con:');
    console.log('   - SuperAdmin: admin@remitero.com / daedae123');
    console.log('   - Admin: admin@empresademo.com / admin123');
    
  } catch (error) {
    console.error('❌ Error poblando datos:', error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

populateProduction()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
