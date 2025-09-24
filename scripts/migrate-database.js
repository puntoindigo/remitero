#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// URLs de las bases de datos
const DATABASE_URLS = {
  dev: "postgres://62d8691c0bca04a5fcb0a8ee92435e1de4d8ed608f10fb2a8ec597f4583e5cb1:sk_hxRVX8P69LXH27p3HUamd@db.prisma.io:5432/postgres?sslmode=require",
  prod: "postgres://58a71080a9a7b2f13b48f45d6141d53bb3e306329eb05e844f7136571d5611a7:sk_Ks5DsRUZncyFERgiKEHcy@db.prisma.io:5432/postgres?sslmode=require"
};

// Función para crear cliente Prisma
function createPrismaClient(databaseUrl) {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
}

// Función para obtener estadísticas de una base de datos
async function getDatabaseStats(prisma) {
  const stats = {
    users: await prisma.user.count(),
    companies: await prisma.company.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    clients: await prisma.client.count(),
    remitos: await prisma.remito.count(),
    remitoItems: await prisma.remitoItem.count(),
    remitoHistory: await prisma.remitoHistory.count()
  };
  return stats;
}

// Función para mostrar estadísticas
function displayStats(stats, label) {
  console.log(`\n📊 ${label}:`);
  console.log(`  👥 Usuarios: ${stats.users}`);
  console.log(`  🏢 Empresas: ${stats.companies}`);
  console.log(`  📂 Categorías: ${stats.categories}`);
  console.log(`  📦 Productos: ${stats.products}`);
  console.log(`  👤 Clientes: ${stats.clients}`);
  console.log(`  📄 Remitos: ${stats.remitos}`);
  console.log(`  📋 Items de Remitos: ${stats.remitoItems}`);
  console.log(`  📝 Historial de Remitos: ${stats.remitoHistory}`);
}

// Función para migrar datos de una base a otra
async function migrateData(sourceUrl, targetUrl, direction) {
  const sourcePrisma = createPrismaClient(sourceUrl);
  const targetPrisma = createPrismaClient(targetUrl);

  try {
    console.log(`\n🔄 Iniciando migración ${direction}...`);
    
    // Conectar a ambas bases de datos
    await sourcePrisma.$connect();
    await targetPrisma.$connect();
    console.log('✅ Conexiones establecidas');

    // Obtener estadísticas de origen
    const sourceStats = await getDatabaseStats(sourcePrisma);
    displayStats(sourceStats, 'Base de datos ORIGEN');

    // Obtener estadísticas de destino
    const targetStats = await getDatabaseStats(targetPrisma);
    displayStats(targetStats, 'Base de datos DESTINO');

    // Confirmar migración
    console.log(`\n⚠️  ADVERTENCIA: Esta operación va a SOBRESCRIBIR todos los datos en la base de datos destino.`);
    console.log(`📋 Datos a migrar:`);
    console.log(`  • ${sourceStats.users} usuarios`);
    console.log(`  • ${sourceStats.companies} empresas`);
    console.log(`  • ${sourceStats.categories} categorías`);
    console.log(`  • ${sourceStats.products} productos`);
    console.log(`  • ${sourceStats.clients} clientes`);
    console.log(`  • ${sourceStats.remitos} remitos`);
    console.log(`  • ${sourceStats.remitoItems} items de remitos`);
    console.log(`  • ${sourceStats.remitoHistory} historial de remitos`);

    // En modo no interactivo, proceder automáticamente
    if (process.argv.includes('--force')) {
      console.log('\n🚀 Modo forzado activado, procediendo con la migración...');
    } else {
      console.log('\n❓ ¿Continuar con la migración? (Ctrl+C para cancelar)');
      console.log('💡 Usa --force para omitir esta confirmación');
      
      // Esperar 5 segundos para que el usuario pueda cancelar
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('⏰ Tiempo de espera completado, procediendo...');
    }

    // Limpiar base de datos destino
    console.log('\n🧹 Limpiando base de datos destino...');
    await targetPrisma.remitoHistory.deleteMany();
    await targetPrisma.remitoItem.deleteMany();
    await targetPrisma.remito.deleteMany();
    await targetPrisma.product.deleteMany();
    await targetPrisma.client.deleteMany();
    await targetPrisma.category.deleteMany();
    await targetPrisma.user.deleteMany();
    await targetPrisma.company.deleteMany();
    console.log('✅ Base de datos destino limpiada');

    // Migrar empresas
    console.log('\n🏢 Migrando empresas...');
    const companies = await sourcePrisma.company.findMany();
    for (const company of companies) {
      await targetPrisma.company.create({
        data: {
          id: company.id,
          name: company.name,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt
        }
      });
    }
    console.log(`✅ ${companies.length} empresas migradas`);

    // Migrar usuarios
    console.log('\n👥 Migrando usuarios...');
    const users = await sourcePrisma.user.findMany();
    for (const user of users) {
      await targetPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          role: user.role,
          address: user.address,
          phone: user.phone,
          companyId: user.companyId,
          impersonatingUserId: user.impersonatingUserId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ ${users.length} usuarios migrados`);

    // Migrar categorías
    console.log('\n📂 Migrando categorías...');
    const categories = await sourcePrisma.category.findMany();
    for (const category of categories) {
      await targetPrisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          companyId: category.companyId,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }
      });
    }
    console.log(`✅ ${categories.length} categorías migradas`);

    // Migrar productos
    console.log('\n📦 Migrando productos...');
    const products = await sourcePrisma.product.findMany();
    for (const product of products) {
      await targetPrisma.product.create({
        data: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          companyId: product.companyId,
          categoryId: product.categoryId,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      });
    }
    console.log(`✅ ${products.length} productos migrados`);

    // Migrar clientes
    console.log('\n👤 Migrando clientes...');
    const clients = await sourcePrisma.client.findMany();
    for (const client of clients) {
      await targetPrisma.client.create({
        data: {
          id: client.id,
          name: client.name,
          address: client.address,
          phone: client.phone,
          email: client.email,
          companyId: client.companyId,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      });
    }
    console.log(`✅ ${clients.length} clientes migrados`);

    // Migrar remitos
    console.log('\n📄 Migrando remitos...');
    const remitos = await sourcePrisma.remito.findMany();
    for (const remito of remitos) {
      await targetPrisma.remito.create({
        data: {
          id: remito.id,
          number: remito.number,
          status: remito.status,
          clientId: remito.clientId,
          companyId: remito.companyId,
          createdById: remito.createdById,
          createdAt: remito.createdAt,
          updatedAt: remito.updatedAt
        }
      });
    }
    console.log(`✅ ${remitos.length} remitos migrados`);

    // Migrar items de remitos
    console.log('\n📋 Migrando items de remitos...');
    const remitoItems = await sourcePrisma.remitoItem.findMany();
    for (const item of remitoItems) {
      await targetPrisma.remitoItem.create({
        data: {
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          remitoId: item.remitoId,
          productId: item.productId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }
      });
    }
    console.log(`✅ ${remitoItems.length} items de remitos migrados`);

    // Migrar historial de remitos
    console.log('\n📝 Migrando historial de remitos...');
    const remitoHistory = await sourcePrisma.remitoHistory.findMany();
    for (const history of remitoHistory) {
      await targetPrisma.remitoHistory.create({
        data: {
          id: history.id,
          status: history.status,
          at: history.at,
          remitoId: history.remitoId,
          byUserId: history.byUserId,
          createdAt: history.createdAt,
          updatedAt: history.updatedAt
        }
      });
    }
    console.log(`✅ ${remitoHistory.length} historial de remitos migrado`);

    // Verificar migración
    console.log('\n🔍 Verificando migración...');
    const finalStats = await getDatabaseStats(targetPrisma);
    displayStats(finalStats, 'Base de datos DESTINO (después de migración)');

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log(`📊 Resumen:`);
    console.log(`  • Empresas: ${companies.length} migradas`);
    console.log(`  • Usuarios: ${users.length} migrados`);
    console.log(`  • Categorías: ${categories.length} migradas`);
    console.log(`  • Productos: ${products.length} migrados`);
    console.log(`  • Clientes: ${clients.length} migrados`);
    console.log(`  • Remitos: ${remitos.length} migrados`);
    console.log(`  • Items: ${remitoItems.length} migrados`);
    console.log(`  • Historial: ${remitoHistory.length} migrado`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    throw error;
  } finally {
    await sourcePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
🔄 Script de Migración de Base de Datos

USO:
  node scripts/migrate-database.js <dirección> [opciones]

DIRECCIONES:
  dev-to-prod    Migrar de desarrollo a producción
  prod-to-dev    Migrar de producción a desarrollo

OPCIONES:
  --force        Omitir confirmación (útil para scripts automatizados)
  --help         Mostrar esta ayuda

EJEMPLOS:
  node scripts/migrate-database.js dev-to-prod
  node scripts/migrate-database.js prod-to-dev --force

⚠️  ADVERTENCIA: 
  Esta operación SOBRESCRIBE completamente la base de datos destino.
  Asegúrate de hacer un backup antes de proceder.
    `);
    return;
  }

  const direction = args[0];
  const isForce = args.includes('--force');

  try {
    if (direction === 'dev-to-prod') {
      await migrateData(DATABASE_URLS.dev, DATABASE_URLS.prod, 'DESARROLLO → PRODUCCIÓN');
    } else if (direction === 'prod-to-dev') {
      await migrateData(DATABASE_URLS.prod, DATABASE_URLS.dev, 'PRODUCCIÓN → DESARROLLO');
    } else {
      console.error('❌ Dirección inválida. Usa: dev-to-prod o prod-to-dev');
      console.log('💡 Usa --help para ver la ayuda completa');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 Migración fallida:', error.message);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { migrateData, getDatabaseStats, DATABASE_URLS };
