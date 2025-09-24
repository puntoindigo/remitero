#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Script para ejecutar queries en la base de datos de desarrollo
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.dev_DATABASE_URL || process.env.dev_PRISMA_DATABASE_URL
    }
  }
});

async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('🔧 Script de base de datos de desarrollo');
    console.log('Uso: node scripts/dev-db.js <comando>');
    console.log('');
    console.log('Comandos disponibles:');
    console.log('  populate    - Poblar datos básicos');
    console.log('  clear       - Limpiar todos los datos');
    console.log('  status      - Ver estado de las tablas');
    console.log('  query       - Ejecutar query personalizada');
    return;
  }

  try {
    switch (command) {
      case 'populate':
        await populateData();
        break;
      case 'clear':
        await clearData();
        break;
      case 'status':
        await showStatus();
        break;
      case 'query':
        await executeQuery();
        break;
      default:
        console.log('❌ Comando no reconocido:', command);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function populateData() {
  console.log('🚀 Poblando datos de desarrollo...');
  
  // Crear company
  const company = await prisma.company.upsert({
    where: { name: "Distribuidora Ruben" },
    update: {},
    create: { name: "Distribuidora Ruben" }
  });
  console.log('✅ Company:', company.name);
  
  // Crear usuarios
  const hashedPassword = await bcrypt.hash("daedae123", 10);
  const user = await prisma.user.upsert({
    where: { email: "admin@remitero.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@remitero.com",
      password: hashedPassword,
      role: "SUPERADMIN",
      companyId: company.id
    }
  });
  console.log('✅ User:', user.name);
  
  // Crear categorías
  const categoria1 = await prisma.category.upsert({
    where: { companyId_name: { name: "Productos de Limpieza", companyId: company.id } },
    update: {},
    create: { name: "Productos de Limpieza", companyId: company.id }
  });
  
  const categoria2 = await prisma.category.upsert({
    where: { companyId_name: { name: "Alimentos", companyId: company.id } },
    update: {},
    create: { name: "Alimentos", companyId: company.id }
  });
  console.log('✅ Categorías creadas');
  
  // Crear productos
  const productos = [
    { name: "Detergente Líquido", description: "Detergente líquido para ropa", unitPrice: 450.00, stock: "IN_STOCK", categoryId: categoria1.id, companyId: company.id },
    { name: "Arroz Blanco", description: "Arroz blanco premium", unitPrice: 320.00, stock: "IN_STOCK", categoryId: categoria2.id, companyId: company.id }
  ];
  
  for (const productoData of productos) {
    await prisma.product.upsert({
      where: { companyId_name: { name: productoData.name, companyId: company.id } },
      update: {},
      create: productoData
    });
  }
  console.log('✅ Productos creados');
  
  // Crear clientes
  const clientes = [
    { name: "Cliente Demo 1", address: "Av. Principal 123", phone: "+54 11 1234-5678", email: "cliente1@demo.com", companyId: company.id },
    { name: "Cliente Demo 2", address: "Calle Secundaria 456", phone: "+54 11 8765-4321", email: "cliente2@demo.com", companyId: company.id }
  ];
  
  for (const clienteData of clientes) {
    await prisma.client.upsert({
      where: { companyId_name: { name: clienteData.name, companyId: company.id } },
      update: {},
      create: clienteData
    });
  }
  console.log('✅ Clientes creados');
  
  console.log('🎉 Datos poblados exitosamente');
}

async function clearData() {
  console.log('🗑️ Limpiando datos de desarrollo...');
  
  await prisma.remitoItem.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.remito.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  
  console.log('✅ Datos limpiados');
}

async function showStatus() {
  console.log('📊 Estado de las tablas:');
  
  const counts = await Promise.all([
    prisma.company.count(),
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.client.count(),
    prisma.remito.count()
  ]);
  
  console.log(`  Companies: ${counts[0]}`);
  console.log(`  Users: ${counts[1]}`);
  console.log(`  Categories: ${counts[2]}`);
  console.log(`  Products: ${counts[3]}`);
  console.log(`  Clients: ${counts[4]}`);
  console.log(`  Remitos: ${counts[5]}`);
}

async function executeQuery() {
  const query = process.argv[3];
  if (!query) {
    console.log('❌ Debe proporcionar una query');
    return;
  }
  
  console.log('🔍 Ejecutando query:', query);
  const result = await prisma.$queryRawUnsafe(query);
  console.log('✅ Resultado:', JSON.stringify(result, null, 2));
}

main();
