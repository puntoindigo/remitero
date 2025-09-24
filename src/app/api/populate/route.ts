import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando poblamiento de datos...');
    
    // Crear instancia directa de Prisma
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.PRISMA_DATABASE_URL || process.env.POSTGRES_URL
        }
      }
    });
    
    // Verificar conexión a la base de datos
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');
    
    // Crear company principal
    const company = await prisma.company.upsert({
      where: { name: "Distribuidora Ruben" },
      update: {},
      create: {
        name: "Distribuidora Ruben"
      }
    });
    console.log('✅ Company:', company.name);
    
    // Crear usuario SuperAdmin
    const hashedPassword = await bcrypt.hash("daedae123", 10);
    const superAdminUser = await prisma.user.upsert({
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
    console.log('✅ Super Admin User:', superAdminUser.name);
    
    // Crear usuario Admin Demo
    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const adminDemoUser = await prisma.user.upsert({
      where: { email: "admin@empresademo.com" },
      update: {},
      create: {
        name: "Admin Demo",
        email: "admin@empresademo.com",
        password: hashedAdminPassword,
        role: "ADMIN",
        companyId: company.id
      }
    });
    console.log('✅ Admin Demo User:', adminDemoUser.name);
    
    // Crear categorías
    const categoria1 = await prisma.category.upsert({
      where: { 
        companyId_name: {
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
    
    const categoria2 = await prisma.category.upsert({
      where: { 
        companyId_name: {
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
        unitPrice: 450.00,
        stock: "IN_STOCK",
        categoryId: categoria1.id,
        companyId: company.id
      },
      {
        name: "Arroz Blanco",
        description: "Arroz blanco premium, 1kg",
        unitPrice: 320.00,
        stock: "IN_STOCK",
        categoryId: categoria2.id,
        companyId: company.id
      },
      {
        name: "Aceite de Girasol",
        description: "Aceite de girasol, 900ml",
        unitPrice: 280.00,
        stock: "OUT_OF_STOCK",
        categoryId: categoria2.id,
        companyId: company.id
      }
    ];
    
    for (const productoData of productos) {
      await prisma.product.upsert({
        where: {
          companyId_name: {
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
      await prisma.client.upsert({
        where: {
          companyId_name: {
            name: clienteData.name,
            companyId: company.id
          }
        },
        update: {},
        create: clienteData
      });
    }
    console.log('✅ Clientes creados');
    
    return NextResponse.json({ 
      success: true, 
      message: "Datos poblados exitosamente",
      data: {
        company: company.name,
        users: [superAdminUser.name, adminDemoUser.name],
        categories: 2,
        products: 3,
        clients: 2
      }
    });
    
  } catch (error) {
    console.error('❌ Error poblando datos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
