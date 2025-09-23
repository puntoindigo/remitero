#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

// URLs directas (reemplaza con las tuyas)
const DEV_DB_URL = "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require";
const PROD_DB_URL = "postgres://31d208b96a7d50b7aa479f9b0248242e25025c8aec8a48375e47a0345647685f:sk_8eQqp5Zk3APwz315E8sAB@db.prisma.io:5432/postgres?sslmode=require";

const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: DEV_DB_URL
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DB_URL
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // Conectar a ambas bases
    await devPrisma.$connect();
    console.log('✅ Conexión a desarrollo: OK');
    
    await prodPrisma.$connect();
    console.log('✅ Conexión a producción: OK');
    
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
