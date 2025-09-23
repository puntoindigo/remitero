#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// Usar las variables del .env local
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.dev_DATABASE_URL
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // Verificar variables
    console.log('🔍 Variables de entorno:');
    console.log('dev_DATABASE_URL:', process.env.dev_DATABASE_URL ? '✅ Configurada' : '❌ No encontrada');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Configurada' : '❌ No encontrada');
    
    if (!process.env.dev_DATABASE_URL || !process.env.POSTGRES_URL) {
      throw new Error('Variables de entorno no configuradas');
    }
    
    // Conectar a ambas bases
    await devPrisma.$connect();
    await prodPrisma.$connect();
    
    console.log('✅ Conexiones establecidas');
    
    // Migrar datos básicos
    console.log('📦 Migrando companies...');
    const companies = await devPrisma.company.findMany();
    for (const company of companies) {
      await prodPrisma.company.upsert({
        where: { id: company.id },
        update: company,
        create: company
      });
    }
    console.log(`✅ ${companies.length} companies migradas`);
    
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
    
    console.log('📄 Migrando remitos...');
    const remitos = await devPrisma.remito.findMany({
      include: {
        items: true
      }
    });
    
    for (const remito of remitos) {
      const { items, ...remitoData } = remito;
      await prodPrisma.remito.upsert({
        where: { id: remito.id },
        update: remitoData,
        create: remitoData
      });
      
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

migrateData()
  .then(() => {
    console.log('✅ Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falló:', error);
    process.exit(1);
  });
