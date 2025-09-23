#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Configurar clientes para cada base de datos
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.dev_DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos de desarrollo a producción...');
    
    // 1. Verificar conexión a ambas bases de datos
    console.log('🔍 Verificando conexiones...');
    await devPrisma.$connect();
    console.log('✅ Conexión a desarrollo: OK');
    
    await prodPrisma.$connect();
    console.log('✅ Conexión a producción: OK');
    
    // 2. Aplicar schema a producción
    console.log('📋 Aplicando schema a producción...');
    // Esto se hace con prisma db push
    
    // 3. Migrar datos en orden de dependencias
    console.log('📦 Migrando datos...');
    
    // 3.1 Migrar Companies
    console.log('🏢 Migrando companies...');
    const companies = await devPrisma.company.findMany();
    for (const company of companies) {
      await prodPrisma.company.upsert({
        where: { id: company.id },
        update: company,
        create: company
      });
    }
    console.log(`✅ ${companies.length} companies migradas`);
    
    // 3.2 Migrar Users
    console.log('👥 Migrando users...');
    const users = await devPrisma.user.findMany();
    for (const user of users) {
      await prodPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ ${users.length} users migrados`);
    
    // 3.3 Migrar Categories
    console.log('📂 Migrando categories...');
    const categories = await devPrisma.category.findMany();
    for (const category of categories) {
      await prodPrisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ ${categories.length} categories migradas`);
    
    // 3.4 Migrar Products
    console.log('📦 Migrando products...');
    const products = await devPrisma.product.findMany();
    for (const product of products) {
      await prodPrisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ ${products.length} products migrados`);
    
    // 3.5 Migrar Clients
    console.log('👤 Migrando clients...');
    const clients = await devPrisma.client.findMany();
    for (const client of clients) {
      await prodPrisma.client.upsert({
        where: { id: client.id },
        update: client,
        create: client
      });
    }
    console.log(`✅ ${clients.length} clients migrados`);
    
    // 3.6 Migrar Remitos
    console.log('📄 Migrando remitos...');
    const remitos = await devPrisma.remito.findMany({
      include: {
        items: true
      }
    });
    for (const remito of remitos) {
      // Crear remito sin items primero
      const { items, ...remitoData } = remito;
      await prodPrisma.remito.upsert({
        where: { id: remito.id },
        update: remitoData,
        create: remitoData
      });
      
      // Luego crear items
      for (const item of items) {
        await prodPrisma.remitoItem.upsert({
          where: { id: item.id },
          update: item,
          create: item
        });
      }
    }
    console.log(`✅ ${remitos.length} remitos migrados`);
    
    console.log('🎉 ¡Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Ejecutar migración
migrateData()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
