#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// URL de producción directa
const PROD_DB_URL = "postgresql://postgres.remitero:daedae123@aws-0-us-west-1.pooler.supabase.com:6543/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PROD_DB_URL
    }
  }
});

async function main() {
  try {
    console.log('🚀 Poblando datos de producción...');
    
    // Crear company
    const company = await prisma.company.upsert({
      where: { name: "Distribuidora Ruben" },
      update: {},
      create: { name: "Distribuidora Ruben" }
    });
    console.log('✅ Company:', company.name);
    
    // Crear usuario
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
